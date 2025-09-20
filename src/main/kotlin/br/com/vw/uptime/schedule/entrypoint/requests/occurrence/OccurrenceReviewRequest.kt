package br.com.vw.uptime.schedule.entrypoint.requests.occurrence

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Size
import org.springframework.validation.annotation.Validated

@Validated
data class OccurrenceReviewRequest(
    @field:Min(1)
    @field:Max(10) val rate: Int,
    @field:Size(min = 0, max = 500, message = "Limite de 500 caracteres excedido")
    val comment: String?)
