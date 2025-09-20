package br.com.vw.uptime.schedule.infrastructure.entities.maintenance

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.*

@DynamoDbBean
class PartsEntity {
    @get:DynamoDbPartitionKey
    @get:DynamoDbAttribute("id")
    lateinit var id: String

    @get:DynamoDbFlatten
    @get:DynamoDbIgnoreNulls
    var maintenanceParts: MaintenancePartsEntity? = null

    @get:DynamoDbFlatten
    @get:DynamoDbIgnoreNulls
    var assistanceParts: AssistancePartsEntity? = null
}