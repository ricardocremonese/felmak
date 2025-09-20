package br.com.vw.uptime.schedule.entrypoint.responses

import java.time.LocalDateTime

data class MaintenanceTicketSummaryResponse (
    var id: String,
    var osNumber: String?,
    var vehicle: MaintenanceTicketSummaryVehicle,
    var maintenanceSchedule: MaintenanceScheduleSummary,
    var createdAt: LocalDateTime,
    var type: List<String>? = emptyList(),
    var ticket: Step?,
    var screening: Step?,
    var repair: Step?,
    var inspection: Step?,
    var release: Step?
)

data class MaintenanceTicketSummaryVehicle (
    val name: String? = null,
    val chassis: String? = null
)

data class MaintenanceScheduleSummary (
    val amountTotal: String,
    val protocol: String,
    val createdAt: LocalDateTime,
    val createdBy: String?
)

data class Step (
    val totalExecutionTime: String
)