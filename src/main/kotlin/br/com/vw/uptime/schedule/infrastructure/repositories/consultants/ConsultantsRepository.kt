package br.com.vw.uptime.schedule.infrastructure.repositories.consultants

import br.com.vw.uptime.schedule.infrastructure.entities.consultant.ConsultantEntity
import io.awspring.cloud.dynamodb.DynamoDbTemplate
import org.springframework.stereotype.Repository
import software.amazon.awssdk.enhanced.dynamodb.Expression
import software.amazon.awssdk.enhanced.dynamodb.Key
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest
import software.amazon.awssdk.services.dynamodb.model.AttributeValue

@Repository
class ConsultantsRepository(
    private val dynamoDbTemplate: DynamoDbTemplate
) {

    fun getConsultantsByDealershipId(dn:String) : List<ConsultantEntity> {
        val expressionValues = mapOf(
            ":dn" to AttributeValue.fromS(dn)
        )

        val filterExpression = Expression
            .builder()
            .expression("dn = :dn")
            .expressionValues(expressionValues)
            .build()

        val pageIterate = dynamoDbTemplate.scan(
            ScanEnhancedRequest.builder().filterExpression(filterExpression).build(),
            ConsultantEntity::class.java
        )

        return pageIterate.items().toList()
    }

    fun saveOrUpdateConsultant(consultantEntity:ConsultantEntity): ConsultantEntity {
        return dynamoDbTemplate.save(consultantEntity)
    }

    fun consultantById(consultantId: String): ConsultantEntity? {
        val queryEnhancedRequest  = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional
                .keyEqualTo(Key.builder().partitionValue(consultantId).build()))
            .build()

        val pageIterate = dynamoDbTemplate.query(queryEnhancedRequest, ConsultantEntity::class.java)
        return pageIterate.items().firstOrNull()
    }

    fun getAllConsultants(limit: Int = 1000): List<ConsultantEntity> {
        val scanRequest = ScanEnhancedRequest.builder()
            .limit(limit)
            .build()

        val pageIterate = dynamoDbTemplate.scan(scanRequest, ConsultantEntity::class.java)
        return pageIterate.flatMap { it.items() }
    }

    fun deleteConsultant(consultantId: String): Boolean {
        val consultant = consultantById(consultantId)
        return if (consultant != null) {
            dynamoDbTemplate.delete(consultant)
            true
        } else {
            false
        }
    }
}