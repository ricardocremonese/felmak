package br.com.vw.uptime.schedule.core.models.maintenance

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

class Inspection {

    var inspectionDate: LocalDateTime? = null
    var checkInDate: LocalDate? = null
    var checkInHour: LocalTime? = null
    var checkOutDate: LocalDate? = null
    var checkOutHour: LocalTime? = null
    var estimatedTime: String? = null
    var serviceValidation:Boolean? = null
    var report: String? = null

}