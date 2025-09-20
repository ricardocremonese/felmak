package br.com.vw.uptime.schedule.infrastructure.entities.maintenance

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

@DynamoDbBean
class ReleaseEntity : TicketStep {

    @get:DynamoDbAttribute("serviceOrder")
    var serviceOrder: String? = null

    @get:DynamoDbAttribute("estimatedTime")
    var estimatedTime: String? = null

    @get:DynamoDbAttribute("checkInDate")
    var checkInDate: LocalDate? = null

    @get:DynamoDbAttribute("checkInHour")
    var checkInHour: LocalTime? = null

    @get:DynamoDbAttribute("checkOutDate")
    var checkOutDate: LocalDate? = null

    @get:DynamoDbAttribute("checkOutHour")
    var checkOutHour: LocalTime? = null

    @get:DynamoDbAttribute("report")
    var report: String? = null

    override fun checkInDate(): LocalDateTime {
        return checkInDate?.atTime(checkInHour)!!
    }
    override fun checkOutDate(): LocalDateTime? {
        return checkOutDate?.atTime(checkOutHour)
    }
}