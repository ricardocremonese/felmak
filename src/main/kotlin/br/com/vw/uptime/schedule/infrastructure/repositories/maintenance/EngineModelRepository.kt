package br.com.vw.uptime.schedule.infrastructure.repositories.maintenance

import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.EngineModelEntity
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.EngineModelEntity.Companion.ENGINE_MODEL_GSI_DIG45
import io.awspring.cloud.dynamodb.DynamoDbTemplate
import org.springframework.stereotype.Repository
import software.amazon.awssdk.enhanced.dynamodb.Expression
import software.amazon.awssdk.enhanced.dynamodb.Key
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest
import software.amazon.awssdk.services.dynamodb.model.AttributeValue

@Repository
class EngineModelRepository(private val dynamoDbTemplate: DynamoDbTemplate) {

    fun findByChassis(dig45: String, dig6: String, dig78: String): EngineModelEntity? {
        val filterExpression = Expression
            .builder()
            .expression("dig78 = :dig78 AND (attribute_not_exists(dig6) OR dig6 = :dig6)")
            .expressionValues(mapOf(":dig6" to AttributeValue.fromS(dig6), ":dig78" to AttributeValue.fromS(dig78)))
            .build()

        val queryEnhancedRequest  = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.keyEqualTo(Key.builder().partitionValue(dig45).build()))
            .filterExpression(filterExpression)
            .build()


        val queryResponse = dynamoDbTemplate.query(queryEnhancedRequest, EngineModelEntity::class.java, ENGINE_MODEL_GSI_DIG45)

        return queryResponse.items().firstOrNull()
    }
}