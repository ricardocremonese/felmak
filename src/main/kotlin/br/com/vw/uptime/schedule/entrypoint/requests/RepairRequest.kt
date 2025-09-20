package br.com.vw.uptime.schedule.entrypoint.requests

import br.com.vw.uptime.schedule.entrypoint.responses.FileResponse
import br.com.vw.uptime.schedule.entrypoint.validator.Matches
import java.time.LocalDate
import java.time.LocalTime

class RepairRequest {
    var repairDate: LocalDate? = null
    var checkInDate: LocalDate? = null
    var checkInHour: LocalTime? = null
    var checkOutDate: LocalDate? = null
    var checkOutHour: LocalTime? = null
    var awaitingParts: String? = null
    @Matches(message = "Formato inválido. Somente 00:00", regex = "^(\\d{2}:\\d{2})\$")
    var estimatedTime: String? = null
    var estimatedTroubleshooting: String? = null
    var report: String? = null
}
