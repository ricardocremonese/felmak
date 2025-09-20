package br.com.vw.uptime.schedule.entrypoint.responses.occurrence

import java.time.LocalDateTime

class OccurrenceStepResponse {
    var stepName:String? = null
    var stepDescription:String? = null
    var startDate:LocalDateTime? = null
    var expectedEndDate:LocalDateTime? = null
    var endDate:LocalDateTime? = null
    var estimatedTime: String? = null
    var latest:Int? = null
}