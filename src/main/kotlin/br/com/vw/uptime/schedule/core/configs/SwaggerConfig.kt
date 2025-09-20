package br.com.vw.uptime.schedule.core.configs

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.security.SecurityScheme
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.servers.Server
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class SwaggerConfig {

    @Value("\${server.servlet.context-path:/}")
    lateinit var contextPath: String

    @Bean
    fun customOpenApi(): OpenAPI {
        return OpenAPI()
            .info(
                Info()
                    .title("Uptime Schedule API")
                    .description("API para gerenciamento de agendamentos e ocorrências do sistema Uptime")
                    .version("1.0.0")
                    .contact(
                        Contact()
                            .name("Volkswagen")
                            .email("support@volkswagen.com")
                    )
            )
            .addServersItem(Server().url(contextPath))
            .components(
                Components()
                    .addSecuritySchemes(
                        "bearerAuth", SecurityScheme()
                            .type(SecurityScheme.Type.HTTP)
                            .scheme("bearer")
                            .bearerFormat("JWT")
                            .description("JWT token de autenticação. Use o formato: Bearer <seu_token>")
                    )
            )
            .addSecurityItem(
                SecurityRequirement()
                    .addList("bearerAuth")
            )
    }
} 