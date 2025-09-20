package br.com.vw.uptime.schedule.infrastructure.repositories.maintenance

import br.com.vw.uptime.schedule.core.configs.properties.AwsProperties
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.PartsEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.AbstractRepository
import org.springframework.stereotype.Repository
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient
import software.amazon.awssdk.enhanced.dynamodb.Key
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest

@Repository
class MaintenancePartsRepository(dynamoDbTemplate: DynamoDbEnhancedClient, config: AwsProperties) :
    AbstractRepository<PartsEntity>(
        TABLE_NAME,
        dynamoDbTemplate,
        PartsEntity::class.java,
        config,){
    companion object {

        private const val TABLE_NAME = "maintenanceParts"
        const val MAINTENANCE_PARTS_GSI_MODEL_UUID_GROUP = "maintenance_parts_model_uuid_group"
        const val ASSISTANCE_PARTS_GSI_PART_NUMBER = "assistance_parts_part_number"
    }

    fun findByModelUuidGroupAndKm(modelUuid: String, group: String, km: Long): List<PartsEntity> {
        val queryEnhancedRequest  = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.keyEqualTo(Key.builder().partitionValue("$modelUuid#$group").sortValue(km).build()))
            .build()

        return getItemsByGsi(MAINTENANCE_PARTS_GSI_MODEL_UUID_GROUP, queryEnhancedRequest)
    }

    fun findByPartNumber(partNumber: String): List<PartsEntity> {
        val queryEnhancedRequest  = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.keyEqualTo(Key.builder().partitionValue(partNumber).build()))
            .build()

        return getItemsByGsi(ASSISTANCE_PARTS_GSI_PART_NUMBER, queryEnhancedRequest)
    }

    fun findByModelUuidGroupAndRangeKm(modelUuid: String, group: String, kmStart: Long, kmEnd: Long): List<PartsEntity> {
        val key = Key.builder().partitionValue("$modelUuid#$group")

        val queryEnhancedRequest  = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.sortBetween(key.sortValue(kmStart).build(), key.sortValue(kmEnd).build()))
            .build()

        return getItemsByGsi(MAINTENANCE_PARTS_GSI_MODEL_UUID_GROUP, queryEnhancedRequest)
    }
}