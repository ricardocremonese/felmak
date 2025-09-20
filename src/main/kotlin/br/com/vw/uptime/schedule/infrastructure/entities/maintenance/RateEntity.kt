package br.com.vw.uptime.schedule.infrastructure.entities.maintenance

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import kotlin.properties.Delegates

@DynamoDbBean
class RateEntity {

    @get:DynamoDbAttribute(value = "rate")
    var rate by Delegates.notNull<Int>()

    @get:DynamoDbAttribute(value = "description")
    var description: String? = null
}