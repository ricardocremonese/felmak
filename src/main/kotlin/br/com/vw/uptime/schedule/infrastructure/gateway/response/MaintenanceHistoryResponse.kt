package br.com.vw.uptime.schedule.infrastructure.gateway.response

import br.com.vw.uptime.schedule.core.models.maintenance.CheckupSchedule
import br.com.vw.uptime.schedule.core.models.assistance.AssistanceListItem
import br.com.vw.uptime.schedule.entrypoint.responses.MaintenanceTicketDetailResponse
import java.time.LocalDateTime

data class MaintenanceHistoryResponse(
    val type: String,
    val date: LocalDateTime,
    val scheduling: CheckupSchedule? = null,
    val ticket: MaintenanceTicketDetailResponse? = null,
    val assistance: AssistanceListItem? = null
)
