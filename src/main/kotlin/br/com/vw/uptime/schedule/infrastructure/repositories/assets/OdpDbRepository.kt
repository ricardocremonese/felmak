package br.com.vw.uptime.schedule.infrastructure.repositories.assets

import br.com.vw.uptime.schedule.core.configs.NormalizeDynamoDbTableNameResolver
import br.com.vw.uptime.schedule.infrastructure.entities.asset.UptimeAssetEntity
import io.awspring.cloud.dynamodb.DynamoDbTemplate
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Repository
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient
import software.amazon.awssdk.enhanced.dynamodb.Key
import software.amazon.awssdk.enhanced.dynamodb.MappedTableResource
import software.amazon.awssdk.enhanced.dynamodb.TableSchema
import software.amazon.awssdk.enhanced.dynamodb.model.BatchGetItemEnhancedRequest
import software.amazon.awssdk.enhanced.dynamodb.model.ReadBatch

@Repository
@Deprecated(message = "Use the UptimeAssetRepository instead")
class OdpDbRepository(
    private val dynamoDbTemplate: DynamoDbTemplate,
    private val normalizeDynamoDbTableNameResolver: NormalizeDynamoDbTableNameResolver,
    private val dynamoDbEnhancedClient: DynamoDbEnhancedClient
) {

    @Value("\${aws.dynamodb.suffix}")
    private lateinit var tableSuffix: String

    fun getOdpDataByChassis(chassis:String): UptimeAssetEntity? {
        return dynamoDbTemplate.load(
            Key
            .builder()
            .partitionValue(chassis)
            .build(),
            UptimeAssetEntity::class.java
        )
    }

    fun getUptimeAssetDataByChassisList(chassisList:List<String>): List<UptimeAssetEntity> {
        val tableName = normalizeDynamoDbTableNameResolver.resolve(UptimeAssetEntity::class.java)
        val table: MappedTableResource<UptimeAssetEntity> = dynamoDbEnhancedClient.table(tableName, TableSchema.fromBean(UptimeAssetEntity::class.java))

        val results = mutableListOf<UptimeAssetEntity>()

        val batches = chassisList.chunked(100)

        for (batch in batches) {

            val readBatchBuilder = ReadBatch.builder(UptimeAssetEntity::class.java)
                .mappedTableResource(table)

            batch.forEach { chassis ->
                val key = Key.builder().partitionValue(chassis).build()
                readBatchBuilder.addGetItem(key)


            }

            val batchRequest = BatchGetItemEnhancedRequest.builder()
                .addReadBatch(readBatchBuilder.build())

                .build()

            val response = dynamoDbEnhancedClient.batchGetItem(batchRequest)

            results += response.resultsForTable(table)
        }

        return results
    }

}