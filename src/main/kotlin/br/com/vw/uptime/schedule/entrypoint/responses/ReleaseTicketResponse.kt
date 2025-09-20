package br.com.vw.uptime.schedule.entrypoint.responses

import java.time.LocalDate
import java.time.LocalTime

class ReleaseTicketResponse {
    var serviceOrder: String? = null
    var estimatedTime: String? = null
    var checkInDate: LocalDate? = null
    var checkInHour: LocalTime? = null
    var checkOutDate: LocalDate? = null
    var checkOutHour: LocalTime? = null
    val report: String? = null
}
