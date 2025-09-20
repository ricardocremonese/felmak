package br.com.vw.uptime.schedule.entrypoint.requests

import br.com.vw.uptime.schedule.entrypoint.validator.Matches
import jakarta.validation.constraints.Pattern
import java.time.LocalDate
import java.time.LocalTime

class InspectionRequest {

    var checkInDate: LocalDate? = null
    var checkInHour: LocalTime? = null
    var serviceValidation:Boolean? = false
    var report: String? = null
    @Pattern(regexp = "^(\\d{1,}:\\d{2})\$", message = "Formato inválido. Somente 00:00")
    var estimatedTime: String? = null
}