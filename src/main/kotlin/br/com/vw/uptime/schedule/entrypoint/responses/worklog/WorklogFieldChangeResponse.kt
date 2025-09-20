package br.com.vw.uptime.schedule.entrypoint.responses.worklog

import java.time.LocalDateTime

/**
 * Response DTO para logs de alteração de campos
 */
data class WorklogFieldChangeResponse(
    val id: Long,
    val fieldName: String,
    val oldValue: String?,
    val newValue: String?,
    val fieldType: String?,
    val changedAt: LocalDateTime
)
