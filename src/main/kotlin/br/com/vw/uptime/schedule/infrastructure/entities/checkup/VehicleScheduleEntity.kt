package br.com.vw.uptime.schedule.infrastructure.entities.checkup

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import java.time.LocalDateTime

@DynamoDbBean
class VehicleScheduleEntity {

    @get:DynamoDbAttribute("vehicle")
    lateinit var vehicle: VehicleEntity

    @get:DynamoDbAttribute("driver")
    var driver: DriverEntity? = null

    @get:DynamoDbAttribute("generalObservations")
    lateinit var generalObservations:String

    @get:DynamoDbAttribute("comments")
    var comments:String = ""

    @get:DynamoDbAttribute("dealership")
    lateinit var dealership: DealershipChild

    @get:DynamoDbAttribute("maintenance")
    var maintenance:MaintenanceEntity? = null

    @get:DynamoDbAttribute("otherServices")
    lateinit var otherServices: List<VehicleServiceEntity>
}

@DynamoDbBean
class MaintenanceEntity {
    @get:DynamoDbAttribute("statusId")
    lateinit var statusId:String

    @get:DynamoDbAttribute("checkInDate")
    lateinit var checkInDate:LocalDateTime

    @get:DynamoDbAttribute("checkoutDate")
    var checkoutDate:LocalDateTime? = null

    @get:DynamoDbAttribute("serviceOrder")
    var serviceOrder:String? = null
}