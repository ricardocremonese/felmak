package br.com.vw.uptime.schedule.infrastructure.entities.maintenance

import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.MaintenancePartsRepository.Companion.MAINTENANCE_PARTS_GSI_MODEL_UUID_GROUP
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondarySortKey
import java.math.BigDecimal
import java.math.BigInteger

@DynamoDbBean
class MaintenancePartsEntity {
    @get:DynamoDbAttribute("code")
    lateinit var code: String

    @get:DynamoDbAttribute("createdAt")
    lateinit var createdAt: BigInteger

    @get:DynamoDbAttribute("description")
    lateinit var description: String

    @get:DynamoDbAttribute("group")
    lateinit var group: String

    @get:DynamoDbAttribute("km")
    @get:DynamoDbSecondarySortKey(indexNames = [MAINTENANCE_PARTS_GSI_MODEL_UUID_GROUP])
    lateinit var km: BigInteger

    @get:DynamoDbAttribute("model")
    lateinit var model: String

    @get:DynamoDbAttribute("quantity")
    lateinit var quantity: BigDecimal

    @get:DynamoDbAttribute("modelUuidGroup")
    @get:DynamoDbSecondaryPartitionKey(indexNames = [MAINTENANCE_PARTS_GSI_MODEL_UUID_GROUP])
    lateinit var modelUuidGroup: String
}