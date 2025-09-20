package br.com.vw.uptime.schedule.infrastructure.entities.checkup

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean

@DynamoDbBean
class ConsultantScheduleChild {

    @get:DynamoDbAttribute(value = "id")
    lateinit var id: String

    @get:DynamoDbAttribute(value = "dn")
    lateinit var dn: String

    @get:DynamoDbAttribute(value = "accountId")
    lateinit var accountId: String

    @get:DynamoDbAttribute(value = "firstName")
    lateinit var firstName:String

    @get:DynamoDbAttribute(value = "lastName")
    lateinit var lastName:String

    @get:DynamoDbAttribute(value = "email")
    lateinit var email:String

    @get:DynamoDbAttribute(value = "phoneNumber")
    lateinit var phoneNumber:String
}