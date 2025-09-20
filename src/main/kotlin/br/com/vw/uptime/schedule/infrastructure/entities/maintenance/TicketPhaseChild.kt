package br.com.vw.uptime.schedule.infrastructure.entities.maintenance

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

@DynamoDbBean
class TicketPhaseChild : TicketStep {

    @get:DynamoDbAttribute("checkInDate")
    var checkInDate: LocalDate? = null

    @get:DynamoDbAttribute("checkInHour")
    var checkInHour: LocalTime? = null

    @get:DynamoDbAttribute("checkOutDate")
    var checkOutDate: LocalDate? = null

    @get:DynamoDbAttribute("checkOutHour")
    var checkOutHour: LocalTime? = null

    @get:DynamoDbAttribute("alerts")
    lateinit var alerts: List<AlertChild>

    @get:DynamoDbAttribute("distanceToDealership")
    var distanceToDealership: Double? = null

    @get:DynamoDbAttribute("electricFence")
    var electricFence: Boolean? = null

    var serviceChecklist:List<CheckupChecklistChildEntity> = listOf()

    override fun checkInDate(): LocalDateTime {
        return checkInDate?.atTime(checkInHour)!!
    }
    override fun checkOutDate(): LocalDateTime? {
        return checkOutDate?.atTime(checkOutHour)
    }
}

@DynamoDbBean
class CheckupChecklistChildEntity {
    lateinit var name:String
    lateinit var items:Map<String, ItemCheckupChecklistEntity>
}

@DynamoDbBean
class ItemCheckupChecklistEntity {
    lateinit var name: String
    var ok:Boolean = false
}