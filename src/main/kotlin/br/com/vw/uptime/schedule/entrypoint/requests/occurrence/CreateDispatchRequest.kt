package br.com.vw.uptime.schedule.entrypoint.requests.occurrence

import br.com.vw.uptime.schedule.core.enums.occurrence.OccurrenceDispatchType
import jakarta.validation.constraints.NotNull

data class CreateDispatchRequest(@field:NotNull val occurrenceType: OccurrenceDispatchType,
                                 @field:NotNull val payer: String,
                                 @field:NotNull val authorizePayment: Boolean,
                                 @field:NotNull val dn: String,
                                 @field:NotNull val route: String)
