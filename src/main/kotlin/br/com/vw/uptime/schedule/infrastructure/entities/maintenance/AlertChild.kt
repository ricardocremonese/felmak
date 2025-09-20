package br.com.vw.uptime.schedule.infrastructure.entities.maintenance

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean

@DynamoDbBean
class AlertChild {

    @get:DynamoDbAttribute("id")
    lateinit var id: String

    @get:DynamoDbAttribute("date")
    lateinit var date: String

    @get:DynamoDbAttribute("description")
    lateinit var description: String

    @get:DynamoDbAttribute("vehicleId")
    lateinit var vehicleId: String

    @get:DynamoDbAttribute("vehicle")
    lateinit var vehicle: String

    @get:DynamoDbAttribute("latitude")
    var latitude: Long = 0

    @get:DynamoDbAttribute("longitude")
    var longitude: Long = 0

    @get:DynamoDbAttribute("vin")
    lateinit var vin: String

    @get:DynamoDbAttribute("spn")
    lateinit var spn: String

    @get:DynamoDbAttribute("spnDescription")
    lateinit var spnDescription: String

    @get:DynamoDbAttribute("fmi")
    lateinit var fmi: String

    @get:DynamoDbAttribute("fmiDescription")
    lateinit var fmiDescription: String

    @get:DynamoDbAttribute("lampStatus")
    lateinit var lampStatus: String

    @get:DynamoDbAttribute("sourceAddress")
    lateinit var sourceAddress: String

    @get:DynamoDbAttribute("km")
    lateinit var km: String
}