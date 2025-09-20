package br.com.vw.uptime.schedule.infrastructure.entities.checkup

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import java.math.BigDecimal

@DynamoDbBean
class VehicleServiceEntity {

    @get:DynamoDbAttribute("id")
    lateinit var id:String

    @get:DynamoDbAttribute("name")
    lateinit var name:String

    @get:DynamoDbAttribute("price")
    lateinit var price:BigDecimal
}