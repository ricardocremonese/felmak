package br.com.vw.uptime.schedule.infrastructure.entities.checkup

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean

@DynamoDbBean
class VehiclePartEntity {

    @get:DynamoDbAttribute(value = "id")
    lateinit var id:String

    @get:DynamoDbAttribute(value = "name")
    lateinit var name:String

}