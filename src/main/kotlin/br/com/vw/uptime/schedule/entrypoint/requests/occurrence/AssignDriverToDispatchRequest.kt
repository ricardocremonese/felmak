package br.com.vw.uptime.schedule.entrypoint.requests.occurrence

import jakarta.validation.constraints.NotNull

data class AssignDriverToDispatchRequest(@field:NotNull val driver: String)
