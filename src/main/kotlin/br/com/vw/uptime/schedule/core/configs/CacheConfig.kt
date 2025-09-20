package br.com.vw.uptime.schedule.core.configs

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "cache")
class CacheConfig {
    
    /**
     * Habilita o carregamento automático do cache na inicialização da aplicação
     * Default: true
     */
    var autoLoadOnStartup: Boolean = true
    
    /**
     * Habilita logs detalhados do cache
     * Default: false
     */
    var enableDetailedLogs: Boolean = false
    
    /**
     * Tempo de expiração do cache em horas
     * Default: 2
     */
    var expirationHours: Int = 2
}
