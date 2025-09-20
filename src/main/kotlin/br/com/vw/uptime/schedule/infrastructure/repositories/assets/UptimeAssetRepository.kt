package br.com.vw.uptime.schedule.infrastructure.repositories.assets

import br.com.vw.uptime.schedule.core.configs.properties.AwsProperties
import br.com.vw.uptime.schedule.core.converters.Mapping
import br.com.vw.uptime.schedule.infrastructure.entities.asset.UptimeAssetEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.AbstractRepository
import org.springframework.stereotype.Repository
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient
import software.amazon.awssdk.enhanced.dynamodb.Key
import java.time.LocalDateTime

@Repository
class UptimeAssetRepository(dynamoDbTemplate: DynamoDbEnhancedClient, config: AwsProperties) :
    AbstractRepository<UptimeAssetEntity>(
        UPTIME_ASSET,
        dynamoDbTemplate,
        UptimeAssetEntity::class.java,
        config,) {

    companion object {
        private const val UPTIME_ASSET = "uptimeAsset"
    }

    fun findByChassis(chassis: String): UptimeAssetEntity? {
            return getItem(Key.builder().partitionValue(chassis).build())
        }

    fun getUptimeAssetsByChassisList(chassisList:List<String>): List<UptimeAssetEntity> {
            val keys = chassisList.map { id -> Key.builder().partitionValue(id).build() }
            return readBatchByKeys(keys)
    }

    fun getByChassisList(chassisList: List<String>): List<UptimeAsset> {
        return getUptimeAssetsByChassisList(chassisList)
            .map { item ->  UptimeAsset(chassis = item.chassis, odometer = item.odometer, lastOdometerUpdate = item.lastOdometerUpdate, hourmeter = item.hourmeter, lastHourmeterUpdate = item.lastHourmeterUpdate,)}
    }

    fun save(item: UptimeAssetEntity): UptimeAssetEntity {
        return saveItem(item)
    }
}

data class UptimeAsset(
    val id: String? = null,
    val chassis: String,
    val odometer: Long?,
    val lastOdometerUpdate: LocalDateTime?,
    val hourmeter: Long?,
    val lastHourmeterUpdate: LocalDateTime?
)