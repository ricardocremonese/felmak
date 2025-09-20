package br.com.vw.uptime.schedule.infrastructure.entities.maintenance

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey

@DynamoDbBean
class ModelCodeEntity {
    @get:DynamoDbPartitionKey
    @get:DynamoDbAttribute("modelCode")
    lateinit var modelCode: String

    @get:DynamoDbAttribute("segment")
    var segment: String? = null

    @get:DynamoDbAttribute("description")
    var description: String? = null

    @get:DynamoDbAttribute("modelId")
    var modelId: String? = null
}