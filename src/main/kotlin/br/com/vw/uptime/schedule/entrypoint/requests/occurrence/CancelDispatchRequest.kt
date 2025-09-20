package br.com.vw.uptime.schedule.entrypoint.requests.occurrence

import br.com.vw.uptime.schedule.core.enums.occurrence.DispatchRefusalType
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class CancelDispatchRequest(@field:NotNull val reason: DispatchRefusalType,
                                 @field:Size(max = 600, message = "Limite de caracteres excedido") val description: String,)
