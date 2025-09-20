package br.com.vw.uptime.schedule.core.filters

import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class FilterConfig {

    @Value("\${jwks.host}")
    private lateinit var jwksUrl: String

    @Bean
    fun customFilter(): FilterRegistrationBean<LoggingFilter> {
        val registrationBean = FilterRegistrationBean(LoggingFilter(jwksUrl))
        registrationBean.addUrlPatterns("/v1/*", "/v2/*") // Apply to specific URL patterns
        registrationBean.order = 2 // Set filter order, lower runs earlier
        return registrationBean
    }

}