package br.com.vw.uptime.schedule.core.models.maintenance.ticket

enum class TicketStatusGroup(
    val status:String
) {

    PENDING("P"),
    FINISHED("F")
}