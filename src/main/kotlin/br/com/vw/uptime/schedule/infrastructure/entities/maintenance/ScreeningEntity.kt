package br.com.vw.uptime.schedule.infrastructure.entities.maintenance

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

@DynamoDbBean
class ScreeningEntity : TicketStep {

    @get:DynamoDbAttribute("dealership")
    var dealership: String? = null

    @get:DynamoDbAttribute("corporateTaxId")
    var corporateTaxId: String? = null

    @get:DynamoDbAttribute("location")
    var location: String? = null

    @get:DynamoDbAttribute("agentName")
    var agentName: String? = null

    @get:DynamoDbAttribute("checkInDate")
    var checkInDate: LocalDate? = null

    @get:DynamoDbAttribute("checkInHour")
    var checkInHour: LocalTime? = null

    @get:DynamoDbAttribute("checkOutDate")
    var checkOutDate: LocalDate? = null

    @get:DynamoDbAttribute("checkOutHour")
    var checkOutHour: LocalTime? = null

    @get:DynamoDbAttribute("checkInDriverLocation")
    var checkInDriverLocation: String? = null

    @get:DynamoDbAttribute("serviceOrder")
    var serviceOrder: String? = null

    @get:DynamoDbAttribute("serviceOrderDate")
    var serviceOrderDate: LocalDateTime? = null

    @get:DynamoDbAttribute("failIndication")
    var failIndication: String? = null

    @get:DynamoDbAttribute("failCode")
    var failCode: String? = null

    @get:DynamoDbAttribute("diagnosisTool")
    var diagnosisTool: String? = null

    @get:DynamoDbAttribute("diagnosisReport")
    var diagnosisReport: String? = null

    @get:DynamoDbAttribute("troubleshootingDoc")
    var troubleshootingDoc: String? = null

    @get:DynamoDbAttribute("estimatedTimeTroubleshooting")
    var estimatedTimeTroubleshooting: String? = null
    
    @get:DynamoDbAttribute("estimatedTimeBoxEntry")
    var estimatedTimeBoxEntry: String? = null

    @get:DynamoDbAttribute("estimatedTimeRepair")
    var estimatedTimeRepair: String? = null

    @get:DynamoDbAttribute("report")
    var report: String? = null

    @get:DynamoDbAttribute("criticality")
    var criticality: Int? = null

    override fun checkInDate(): LocalDateTime {
        return checkInDate?.atTime(checkInHour)!!
    }
    override fun checkOutDate(): LocalDateTime? {
        return checkOutDate?.atTime(checkOutHour)
    }
}