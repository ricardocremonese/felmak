#!/bin/bash

# Script para executar a aplicação Spring Boot com variáveis de ambiente do .env
# Uso: ./run.sh [comando]
# Comandos disponíveis: start, stop, restart, status, logs

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${2}${1}${NC}"
}

# Função para verificar se o arquivo .env existe
check_env_file() {
    if [ ! -f ".env" ]; then
        print_message "❌ Arquivo .env não encontrado!" $RED
        print_message "Crie um arquivo .env na raiz do projeto com as variáveis necessárias." $YELLOW
        exit 1
    fi
}

# Função para carregar variáveis de ambiente
load_env() {
    print_message "📋 Carregando variáveis de ambiente do arquivo .env..." $BLUE
    
    # Verificar se o arquivo .env existe
    check_env_file
    
    # Carregar variáveis de ambiente
    export $(cat .env | grep -v '^#' | xargs)
    
    print_message "✅ Variáveis de ambiente carregadas:" $GREEN
    echo "   - POSTGRES_HOST: $POSTGRES_HOST"
    echo "   - POSTGRES_PORT: $POSTGRES_PORT"
    echo "   - POSTGRES_DB: $POSTGRES_DB"
    echo "   - AWS_REGION: $AWS_REGION"
    echo "   - SPRING_PROFILES_ACTIVE: $SPRING_PROFILES_ACTIVE"
    echo ""
}

# Função para verificar se a aplicação está rodando
is_running() {
    if pgrep -f "ScheduleApplicationKt" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Função para obter o PID da aplicação
get_app_pid() {
    pgrep -f "ScheduleApplicationKt" | head -1
}

# Função para iniciar a aplicação
start_app() {
    if is_running; then
        print_message "⚠️  Aplicação já está rodando (PID: $(get_app_pid))" $YELLOW
        return 0
    fi
    
    print_message "🚀 Iniciando aplicação Spring Boot..." $BLUE
    load_env
    
    # Executar em background
    nohup ./gradlew bootRun > app.log 2>&1 &
    
    # Aguardar um pouco para verificar se iniciou
    sleep 5
    
    if is_running; then
        print_message "✅ Aplicação iniciada com sucesso!" $GREEN
        print_message "📊 PID: $(get_app_pid)" $BLUE
        print_message "🌐 URL: http://localhost:8080" $BLUE
        print_message "📋 Health Check: http://localhost:8080/actuator/health" $BLUE
        print_message "📝 Logs: tail -f app.log" $BLUE
    else
        print_message "❌ Falha ao iniciar a aplicação!" $RED
        print_message "📝 Verifique os logs: cat app.log" $YELLOW
        exit 1
    fi
}

# Função para parar a aplicação
stop_app() {
    if ! is_running; then
        print_message "⚠️  Aplicação não está rodando" $YELLOW
        return 0
    fi
    
    print_message "🛑 Parando aplicação..." $BLUE
    local pid=$(get_app_pid)
    
    if [ -n "$pid" ]; then
        kill $pid
        sleep 3
        
        if is_running; then
            print_message "⚠️  Aplicação não parou, forçando parada..." $YELLOW
            kill -9 $pid
            sleep 2
        fi
        
        if ! is_running; then
            print_message "✅ Aplicação parada com sucesso!" $GREEN
        else
            print_message "❌ Não foi possível parar a aplicação" $RED
            exit 1
        fi
    fi
}

# Função para reiniciar a aplicação
restart_app() {
    print_message "🔄 Reiniciando aplicação..." $BLUE
    stop_app
    sleep 2
    start_app
}

# Função para verificar status da aplicação
status_app() {
    if is_running; then
        local pid=$(get_app_pid)
        print_message "✅ Aplicação está rodando" $GREEN
        print_message "📊 PID: $pid" $BLUE
        print_message "🌐 URL: http://localhost:8080" $BLUE
        
        # Testar health check
        if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
            print_message "💚 Health Check: OK" $GREEN
        else
            print_message "💛 Health Check: Não disponível" $YELLOW
        fi
    else
        print_message "❌ Aplicação não está rodando" $RED
    fi
}

# Função para mostrar logs
show_logs() {
    if [ -f "app.log" ]; then
        print_message "📝 Mostrando logs da aplicação (Ctrl+C para sair):" $BLUE
        tail -f app.log
    else
        print_message "⚠️  Arquivo de log não encontrado" $YELLOW
    fi
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start     - Inicia a aplicação"
    echo "  stop      - Para a aplicação"
    echo "  restart   - Reinicia a aplicação"
    echo "  status    - Mostra o status da aplicação"
    echo "  logs      - Mostra os logs em tempo real"
    echo "  help      - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 start"
    echo "  $0 status"
    echo "  $0 logs"
}

# Função principal
main() {
    case "${1:-start}" in
        start)
            start_app
            ;;
        stop)
            stop_app
            ;;
        restart)
            restart_app
            ;;
        status)
            status_app
            ;;
        logs)
            show_logs
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_message "❌ Comando inválido: $1" $RED
            show_help
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"
