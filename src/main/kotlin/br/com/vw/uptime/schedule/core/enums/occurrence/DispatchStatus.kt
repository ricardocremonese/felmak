package br.com.vw.uptime.schedule.core.enums.occurrence

enum class DispatchStatus(val description: String) {
    UNAVAILABLE("Indisponível para atendimento"),
    WAITING_DEALERSHIP("Aguardando concessionária"),
    AVAILABLE("Disponível"),
}