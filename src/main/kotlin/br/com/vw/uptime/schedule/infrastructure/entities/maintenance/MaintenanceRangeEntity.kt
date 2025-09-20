package br.com.vw.uptime.schedule.infrastructure.entities.maintenance

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondarySortKey
import java.math.BigDecimal
import java.math.BigInteger
import java.time.LocalDateTime

@DynamoDbBean
class MaintenanceRangeEntity {

    companion object {
        const val MAINTENANCE_RANGE_GSI_GROUP_MODEL = "maintenance_range_group_engine_gsi"
    }

    @get:DynamoDbPartitionKey
    @get:DynamoDbAttribute("id")
    lateinit var id: String

    @get:DynamoDbAttribute("group")
    @get:DynamoDbSecondaryPartitionKey(indexNames = [MAINTENANCE_RANGE_GSI_GROUP_MODEL])
    lateinit var  group: String

    @get:DynamoDbAttribute("engine")
    @get:DynamoDbSecondarySortKey(indexNames = [MAINTENANCE_RANGE_GSI_GROUP_MODEL])
    lateinit var engine: String

    @get:DynamoDbAttribute("hours")
    lateinit var hours: BigInteger

    @get:DynamoDbAttribute("km")
    lateinit var km: BigDecimal

    @get:DynamoDbAttribute("emissionStandard")
    lateinit var  emissionStandard: String

    @get:DynamoDbAttribute("cc")
    lateinit var  cc: String

    @get:DynamoDbAttribute("createdAt")
    lateinit var  createdAt: LocalDateTime
}