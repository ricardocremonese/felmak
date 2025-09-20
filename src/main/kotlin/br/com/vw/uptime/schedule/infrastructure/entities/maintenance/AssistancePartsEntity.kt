package br.com.vw.uptime.schedule.infrastructure.entities.maintenance

import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.MaintenancePartsRepository.Companion.ASSISTANCE_PARTS_GSI_PART_NUMBER
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey

@DynamoDbBean
class AssistancePartsEntity {
    @get:DynamoDbAttribute("partNumber")
    @get:DynamoDbSecondaryPartitionKey(indexNames = [ASSISTANCE_PARTS_GSI_PART_NUMBER])
    lateinit var partNumber: String

    @get:DynamoDbAttribute("name")
    lateinit var name: String

    @get:DynamoDbAttribute("catalog")
    lateinit var catalog: String

    @get:DynamoDbAttribute("release")
    lateinit var release: String

    @get:DynamoDbAttribute("type")
    lateinit var type: String
}