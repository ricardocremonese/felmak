package br.com.vw.uptime.schedule.infrastructure.repositories.maintenance

import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.ModelCodeEntity
import io.awspring.cloud.dynamodb.DynamoDbTemplate
import org.springframework.stereotype.Repository
import software.amazon.awssdk.enhanced.dynamodb.Key
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest

@Repository
class ModelCodeRepository(private val dynamoDbTemplate: DynamoDbTemplate) {

    fun findByModelCode(modelCode: String): ModelCodeEntity? {
        val queryEnhancedRequest  = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.keyEqualTo(Key.builder().partitionValue(modelCode).build()))
            .build()

        val queryResponse = dynamoDbTemplate.query(queryEnhancedRequest, ModelCodeEntity::class.java)

        return queryResponse.items().firstOrNull()
    }
}