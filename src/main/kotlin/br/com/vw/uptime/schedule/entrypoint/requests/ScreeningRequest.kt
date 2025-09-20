package br.com.vw.uptime.schedule.entrypoint.requests

import br.com.vw.uptime.schedule.entrypoint.validator.Matches
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

class ScreeningRequest {
    var dealership: String? = null
    var corporateTaxId: String? = null
    var location: String? = null
    var agentName: String? = null
    var checkInDate: LocalDate? = null
    var checkInHour: LocalTime? = null
    var checkOutDate: LocalDate? = null
    var checkOutHour: LocalTime? = null
    var checkInDriverLocation: String? = null
    var serviceOrder: String? = null
    var serviceOrderDate: LocalDateTime? = null
    var failIndication: String? = null
    var failCode: String? = null
    var diagnosisTool: String? = null
    var diagnosisReport: String? = null
    var troubleshootingDoc: String? = null

    @Matches(message = "Formato inválido. Somente 00:00", regex = "^(\\d{2}:\\d{2})\$")
    var estimatedTimeTroubleshooting: String? = null
    
    @Matches(message = "Formato inválido. Somente 00:00", regex = "^(\\d{2}:\\d{2})\$")
    var estimatedTimeBoxEntry: String? = null

    @Matches(message = "Formato inválido. Somente 00:00", regex = "^(\\d{2}:\\d{2})\$")
    val estimatedTimeRepair: String? = null

    val report: String? = null

    @Max(5) @Min(1)
    var criticality: Int? = null
}
