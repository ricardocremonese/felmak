package br.com.vw.uptime.schedule.infrastructure.entities.schedule

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import java.time.LocalDateTime

@DynamoDbBean
class StateHistoryItemEntity {
    @get:DynamoDbAttribute(value = "state")
    lateinit var state: String

    @get:DynamoDbAttribute(value = "date")
    lateinit var date: LocalDateTime

    @get:DynamoDbAttribute(value = "scheduleDate")
    var scheduleDate: LocalDateTime? = null
}