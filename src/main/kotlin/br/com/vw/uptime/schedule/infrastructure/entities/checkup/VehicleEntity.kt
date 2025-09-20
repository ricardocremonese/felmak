package br.com.vw.uptime.schedule.infrastructure.entities.checkup

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean

@DynamoDbBean
class VehicleEntity {

    @get:DynamoDbAttribute("assetId")
    lateinit var assetId:String

    @get:DynamoDbAttribute("chassis")
    var chassis:String? = null

    @get:DynamoDbAttribute("plate")
    var plate:String? = null

    @get:DynamoDbAttribute("vehicleModel")
    var vehicleModel:String? = null

    @get:DynamoDbAttribute("vehicleYear")
    var vehicleYear: Int? = null

    @get:DynamoDbAttribute("hourMeter")
    var hourMeter: Long? = null

    @get:DynamoDbAttribute("odometer")
    var odometer: Long? = null

    @get:DynamoDbAttribute("vehicleGroup")
    lateinit var vehicleGroup:String

    @get:DynamoDbAttribute("name")
    var name:String? = null
}
