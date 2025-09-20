package br.com.vw.uptime.schedule.core.configs

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class CorsConfig(@Value("#{'\${cors.domains}'.split(',')}") private val domains: List<String>) {

    @Bean
    fun corsConfigurer(): WebMvcConfigurer {
        return object : WebMvcConfigurer {
            override fun addCorsMappings(registry: CorsRegistry) {
                registry.addMapping("/**")
                    .allowedOrigins(*domains.toTypedArray())
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH") // Allows specific HTTP methods
                    //.allowedHeaders("Authorization", "Content-Type")
                    .allowedHeaders("*")
                    .allowCredentials(true) // Disables sending credentials
            }
        }
    }

}