package br.com.vw.uptime.schedule.infrastructure.repositories.fieldAction

import br.com.vw.uptime.schedule.infrastructure.entities.checkup.FieldCampaignEntity
import io.awspring.cloud.dynamodb.DynamoDbTemplate
import org.springframework.stereotype.Repository
import software.amazon.awssdk.enhanced.dynamodb.Key
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest

@Repository
class FieldCampaignRepository(
    private val dynamoDbTemplate: DynamoDbTemplate
) {

    fun getCampaignByChassisAndNumber(chassis:String, campaignNumber:String) : FieldCampaignEntity? {

        val pageIterate = dynamoDbTemplate.query(
            QueryEnhancedRequest.builder().queryConditional(
                QueryConditional.keyEqualTo(
                    Key.builder()
                        .partitionValue(chassis)
                        .sortValue(campaignNumber)
                        .build()
                )
            ).build(),
            FieldCampaignEntity::class.java
        )
        return pageIterate.items().firstOrNull()
    }

    fun getPendingCampaignByChassis(chassis: String): List<FieldCampaignEntity> {
        val pageIterate = dynamoDbTemplate.query(
            QueryEnhancedRequest.builder().queryConditional(
                QueryConditional.keyEqualTo(
                    Key.builder()
                        .partitionValue(chassis)
                        .build()
                )
            ).build(),
            FieldCampaignEntity::class.java
        )
        return pageIterate.items().toList().filter {
            it.repairStatus.lowercase().contains("pendente")
        }
    }

}