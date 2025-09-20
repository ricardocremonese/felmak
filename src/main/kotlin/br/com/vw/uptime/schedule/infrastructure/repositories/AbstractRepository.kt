package br.com.vw.uptime.schedule.infrastructure.repositories

import br.com.vw.uptime.schedule.core.configs.properties.AwsProperties
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable
import software.amazon.awssdk.enhanced.dynamodb.Key
import software.amazon.awssdk.enhanced.dynamodb.TableSchema
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest
import software.amazon.awssdk.enhanced.dynamodb.model.ReadBatch

abstract class AbstractRepository<T>(tableName: String,
                                     private val dynamoDbClient: DynamoDbEnhancedClient,
                                     private val clazzName: Class<T>,
                                     awsProperties: AwsProperties,) {
    protected val dynamoDbTable: DynamoDbTable<T> = dynamoDbClient.table("$tableName${awsProperties.dynamodb?.suffix}", TableSchema.fromBean (clazzName))

    protected fun readBatchByKeys(keys: List<Key>) : List<T> {
        val batches = keys.chunked(100).map { chunkedKeys ->
            val builderReadBatch = ReadBatch
                .builder(clazzName)
                .mappedTableResource(dynamoDbTable)
            chunkedKeys.forEach { key -> builderReadBatch.addGetItem { k -> k.key(key) } }
            builderReadBatch.build()
        }
        .flatMap { batch -> dynamoDbClient.batchGetItem { b -> b.readBatches(batch) }
            .resultsForTable(dynamoDbTable) }
        .toList()

        return batches
    }

    protected fun saveItem(item: T) : T {
        dynamoDbTable.updateItem(item)
        return item
    }

    protected fun getItem(key: Key) : T = dynamoDbTable.getItem(key)

    protected fun getItems(queryEnhancedRequest: QueryEnhancedRequest) : List<T> =
        dynamoDbTable.query(queryEnhancedRequest)
            .items()
            .toList()

    protected fun getItemsByGsi(gsi: String, queryEnhancedRequest: QueryEnhancedRequest) : List<T> =
        dynamoDbTable.index(gsi)
            .query(queryEnhancedRequest)
            .flatMap { it.items() }
            .toList()

}