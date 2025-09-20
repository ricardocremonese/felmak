package br.com.vw.uptime.schedule.infrastructure.entities.checkup

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean

@DynamoDbBean
class DriverEntity {

    @get:DynamoDbAttribute("driverName")
    lateinit var name: String

    @get:DynamoDbAttribute("driverCnh")
    lateinit var cnh: String

    @get:DynamoDbAttribute("driverEmail")
    lateinit var email: String

    @get:DynamoDbAttribute("driverPhone")
    lateinit var phone: String

}
