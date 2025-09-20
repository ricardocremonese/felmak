package br.com.vw.uptime.schedule.infrastructure.repositories.dealerships

import br.com.vw.uptime.schedule.infrastructure.entities.dealership.DealershipTransRioEntity
import io.awspring.cloud.dynamodb.DynamoDbTemplate
import org.springframework.stereotype.Repository
import software.amazon.awssdk.enhanced.dynamodb.Key
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest

@Repository
class DealershipTransRioRepository(private val dynamoDbTemplate: DynamoDbTemplate) {

    companion object {
        const val DEALERSHIP_TRANSRIO_CHASSIS_GSI_NAME = "dealership_transrio_chassis"
    }


    fun findByChassis(chassis: String): DealershipTransRioEntity? {
        val queryEnhancedRequest  = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.keyEqualTo(Key.builder().partitionValue(chassis).build()))
            .limit(1)
            .build()

        val queryResponse = dynamoDbTemplate.query(queryEnhancedRequest, DealershipTransRioEntity::class.java, DEALERSHIP_TRANSRIO_CHASSIS_GSI_NAME)

        return queryResponse.items().firstOrNull()
    }
}