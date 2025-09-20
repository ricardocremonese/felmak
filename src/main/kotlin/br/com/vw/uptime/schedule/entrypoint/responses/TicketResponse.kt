package br.com.vw.uptime.schedule.entrypoint.responses

import java.time.LocalDate
import java.time.LocalTime

class TicketResponse {

    var checkInDate: LocalDate? = null
    var checkInHour: LocalTime? = null
    var checkOutDate: LocalDate? = null
    var checkOutHour: LocalTime? = null
    lateinit var alerts: List<AlertTicketResponse>
    var distanceToDealership: Double? = null
    var electricFence: Boolean? = null

}