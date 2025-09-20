package br.com.vw.uptime.schedule.entrypoint.responses

import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

class ScreeningResponse {

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
    var estimatedTimeTroubleshooting: String? = null
    var estimatedTimeBoxEntry: String? = null
    var estimatedTimeRepair: String? = null
    var report: String? = null
    var criticality: Int? = null
}
