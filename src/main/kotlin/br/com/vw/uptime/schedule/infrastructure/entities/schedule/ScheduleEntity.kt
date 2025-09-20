package br.com.vw.uptime.schedule.infrastructure.entities.schedule

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey
import java.time.LocalDateTime
import java.util.*

@DynamoDbBean
class ScheduleEntity {

    @get:DynamoDbPartitionKey
    lateinit var id: UUID

    @get:DynamoDbAttribute(value = "booking")
    lateinit var booking: String

    @get:DynamoDbAttribute(value = "state")
    lateinit var state: String

    @get:DynamoDbAttribute(value = "scheduledDate")
    lateinit var scheduledDate: LocalDateTime

    @get:DynamoDbAttribute(value = "createdDate")
    var createdDate: LocalDateTime = LocalDateTime.now()

    @get:DynamoDbAttribute("sourceAccountId")
    lateinit var sourceAccountId: String

    @get:DynamoDbAttribute("sourceUserId")
    lateinit var sourceUserId: String

    @get:DynamoDbAttribute("sourceUserName")
    var sourceUserName: String? = null

    @get:DynamoDbAttribute("destinationAccountId")
    lateinit var destinationAccountId: String

    @get:DynamoDbAttribute("destinationUserId")
    lateinit var destinationUserId: String

    @get:DynamoDbAttribute("stateHistory")
    var stateHistory: List<StateHistoryItemEntity> = arrayListOf()
}

