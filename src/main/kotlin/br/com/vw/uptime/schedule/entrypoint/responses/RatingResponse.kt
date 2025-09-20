package br.com.vw.uptime.schedule.entrypoint.responses

import br.com.vw.uptime.schedule.core.enums.maintenance.StepType

data class RatingResponse(val step: StepType,
                          val rating: Int,
                          val description: String? = null)
