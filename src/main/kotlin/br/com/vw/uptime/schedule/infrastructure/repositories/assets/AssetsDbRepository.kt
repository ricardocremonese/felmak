package br.com.vw.uptime.schedule.infrastructure.repositories.assets

import br.com.vw.uptime.schedule.infrastructure.entities.asset.AssetEntity
import io.awspring.cloud.dynamodb.DynamoDbTemplate
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.awaitAll
import org.springframework.stereotype.Repository
import software.amazon.awssdk.enhanced.dynamodb.Key
import software.amazon.awssdk.enhanced.dynamodb.Expression
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest
import software.amazon.awssdk.services.dynamodb.model.AttributeValue

@Repository
class AssetsDbRepository(
    private val dynamoDbTemplate: DynamoDbTemplate
) {

    fun getAssetByAssetId(accountId:String, assetId: String) : AssetEntity? {
        return dynamoDbTemplate.load(
            Key
            .builder()
            .partitionValue(accountId)
            .sortValue(assetId)
            .build(),
            AssetEntity::class.java
        )
    }

    fun getAssetByChassis(chassis:String) : List<AssetEntity> {

        val queryRequest = QueryEnhancedRequest.builder()
            .queryConditional(
                QueryConditional.keyEqualTo(
                    Key.builder().partitionValue(chassis).build()
                )
            )
            .build()
        return dynamoDbTemplate.query(queryRequest, AssetEntity::class.java, AssetEntity.IDX_ASSET_IDENTIFICATION).flatMap {
            it.items()
        }
    }
    
    fun getAssetIdAndIdentification(): List<AssetIdAndIdentification> {
        val assetIdAndIdentificationList = mutableListOf<AssetIdAndIdentification>()
        
        val scanRequest = ScanEnhancedRequest.builder()
            .attributesToProject("accountId", "id", "identification")
            .build()
        
        val scanResult = dynamoDbTemplate.scan(scanRequest, AssetEntity::class.java)
        scanResult.forEach { page ->
            page.items().forEach { asset ->
                if (asset.identification != null && asset.id != null) {
                    assetIdAndIdentificationList.add(
                        AssetIdAndIdentification(
                            id = asset.id!!,
                            identification = asset.identification!!,
                            accountId = asset.accountId!!
                        )
                    )
                }
            }
        }
        
        return assetIdAndIdentificationList
    }

    fun getAllByAccountId(accountId: String) : List<AssetEntity> {

        val keyCondition = Key.builder().partitionValue(accountId).build()
        val queryConditional = QueryConditional.keyEqualTo(keyCondition)

        val pages = dynamoDbTemplate.query(
            QueryEnhancedRequest.builder()
                .queryConditional(queryConditional)
                .limit(1000)
                .build(),
            AssetEntity::class.java
        )

        return pages.flatMap { it.items() }
    }

    fun getAllByAccountIdCallback(accountId: String, vehicleCallback:(List<AssetEntity>) -> Unit) {

        val keyCondition = Key.builder().partitionValue(accountId).build()
        val queryConditional = QueryConditional.keyEqualTo(keyCondition)

        val pages = dynamoDbTemplate.query(
            QueryEnhancedRequest.builder()
                .queryConditional(queryConditional)
                .limit(1000)
                .build(),
            AssetEntity::class.java
        )

        pages.forEach {
            vehicleCallback(it.items())
        }
    }

    suspend fun getAllByAccountIdBufferedAsync(accountId: String, channel: Channel<AssetEntity>, listenChannel: suspend () -> Unit) = coroutineScope {

        launch {
            val query = QueryConditional.keyEqualTo { it.partitionValue(accountId) }
            var lastKey: Map<String, AttributeValue>? = null

            do {
                val requestBuilder = QueryEnhancedRequest.builder()
                    .queryConditional(query)
                    .limit(1000)
                lastKey?.let { requestBuilder.exclusiveStartKey(it) }

                val page = dynamoDbTemplate.query(requestBuilder.build(), AssetEntity::class.java).first()
                for (item in page.items()) {
                    channel.send(item)
                }

                lastKey = page.lastEvaluatedKey()
            } while (lastKey != null)

            channel.close()
        }
        listenChannel()
    }
    
    data class AssetIdAndIdentification(
        val id: String,
        val identification: String,
        val accountId: String,
        val accountAssetId: String? = null
    )
}