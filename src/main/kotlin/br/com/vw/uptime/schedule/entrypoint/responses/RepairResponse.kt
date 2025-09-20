package br.com.vw.uptime.schedule.entrypoint.responses

import java.time.LocalDate
import java.time.LocalTime

class RepairResponse {
    var repairDate: LocalDate? = null
    var checkInDate: LocalDate? = null
    var checkInHour: LocalTime? = null
    var checkOutDate: LocalDate? = null
    var checkOutHour: LocalTime? = null
    var awaitingParts: String? = null
    var estimatedTime: String? = null
    var estimatedTroubleshooting: String? = null
    var report: String? = null
}
