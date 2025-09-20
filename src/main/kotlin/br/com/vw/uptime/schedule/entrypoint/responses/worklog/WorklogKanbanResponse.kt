package br.com.vw.uptime.schedule.entrypoint.responses.worklog

import br.com.vw.uptime.schedule.infrastructure.services.occurence.StepTypeOccurrence
import java.time.LocalDateTime

/**
 * Response DTO para logs de alteração de etapas no Kanban
 */
data class WorklogKanbanResponse(
    val id: Long,
    val occurrenceId: Int,
    val occurrenceUuid: String,
    val step: StepTypeOccurrence,
    val previousStatus: StepTypeOccurrence?,
    val newStatus: StepTypeOccurrence,
    val userId: String,
    val userUuid: String?,
    val userName: String?,
    val changedAt: LocalDateTime,
    val actionType: String,
    val description: String?,
    val fieldChanges: List<WorklogFieldChangeResponse> = emptyList()
)
