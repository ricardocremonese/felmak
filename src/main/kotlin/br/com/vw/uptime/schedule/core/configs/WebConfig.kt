package br.com.vw.uptime.schedule.core.configs

import br.com.vw.uptime.schedule.infrastructure.filters.RequestContextInterceptor
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig(
    private val requestContextInterceptor: RequestContextInterceptor
) : WebMvcConfigurer {
    
    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(requestContextInterceptor)
            .addPathPatterns("/v1/**")
    }
}
