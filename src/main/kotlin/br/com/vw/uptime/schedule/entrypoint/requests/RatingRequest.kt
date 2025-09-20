package br.com.vw.uptime.schedule.entrypoint.requests

import br.com.vw.uptime.schedule.core.enums.maintenance.StepType

data class RatingRequest(val step: StepType,
                         val rating: Int? = null,
                         val description: String? = null)
