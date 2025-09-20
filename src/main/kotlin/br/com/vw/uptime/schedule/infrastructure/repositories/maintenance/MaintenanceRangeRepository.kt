package br.com.vw.uptime.schedule.infrastructure.repositories.maintenance

import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.MaintenanceRangeEntity
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.MaintenanceRangeEntity.Companion.MAINTENANCE_RANGE_GSI_GROUP_MODEL
import io.awspring.cloud.dynamodb.DynamoDbTemplate
import org.springframework.stereotype.Repository
import software.amazon.awssdk.enhanced.dynamodb.Expression
import software.amazon.awssdk.enhanced.dynamodb.Key
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest
import software.amazon.awssdk.services.dynamodb.model.AttributeValue

@Repository
class MaintenanceRangeRepository(private val dynamoDbTemplate: DynamoDbTemplate) {

    fun findByGroupAndType(group: String, engine: String, emissionStandard: String, cc: String?): MaintenanceRangeEntity? {

        val filterExpressionBuilder = Expression
            .builder()

        if (cc != null) {
            filterExpressionBuilder
                .expression("emissionStandard = :emissionStandard AND (attribute_not_exists(cc) OR cc = :cc)")
                .expressionValues(mapOf(":emissionStandard" to AttributeValue.fromS(emissionStandard), ":cc" to AttributeValue.fromS(cc)))
        } else {
            filterExpressionBuilder
                .expression("emissionStandard = :emissionStandard")
                .expressionValues(mapOf(":emissionStandard" to AttributeValue.fromS(emissionStandard)))
        }

        val queryEnhancedRequest  = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.keyEqualTo(Key.builder().partitionValue(group).sortValue(engine).build()))
            .filterExpression(filterExpressionBuilder.build())
            .build()

        val queryResponse = dynamoDbTemplate.query(queryEnhancedRequest, MaintenanceRangeEntity::class.java, MAINTENANCE_RANGE_GSI_GROUP_MODEL)

        return queryResponse.items().firstOrNull()
    }

    fun findByGroupAndEmissionStandard(group:String, emissionStandard: String?): List<MaintenanceRangeEntity> {

        val queryBuilder = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.keyEqualTo(Key.builder().partitionValue(group).build()))

        if (emissionStandard != null) {
            val expression = Expression
                .builder()
                .expression("emissionStandard = :emissionStandard")
                .expressionValues(mapOf(":emissionStandard" to AttributeValue.fromS(emissionStandard)))
                .build()
            queryBuilder.filterExpression(expression)
        }

        val queryResponse = dynamoDbTemplate.query(queryBuilder.build(), MaintenanceRangeEntity::class.java, MAINTENANCE_RANGE_GSI_GROUP_MODEL)

        return queryResponse.items().toList()
    }
}