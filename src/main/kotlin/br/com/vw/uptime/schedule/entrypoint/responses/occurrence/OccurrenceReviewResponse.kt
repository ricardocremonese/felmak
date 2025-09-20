package br.com.vw.uptime.schedule.entrypoint.responses.occurrence

import br.com.vw.uptime.schedule.infrastructure.services.occurence.StepTypeOccurrence

data class OccurrenceReviewResponse(
    val uuid: String,
    val step: StepTypeOccurrence?,
    val rate: Int?,
    val comment: String?,
)