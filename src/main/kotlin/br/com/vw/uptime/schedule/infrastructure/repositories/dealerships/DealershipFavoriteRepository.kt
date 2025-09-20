package br.com.vw.uptime.schedule.infrastructure.repositories.dealerships

import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.infrastructure.entities.dealership.DealershipFavoriteEntity
import io.awspring.cloud.dynamodb.DynamoDbTemplate
import org.springframework.stereotype.Repository
import software.amazon.awssdk.enhanced.dynamodb.Expression
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest
import software.amazon.awssdk.services.dynamodb.model.AttributeValue

@Repository
class DealershipFavoriteRepository(
    private val dynamoDbTemplate: DynamoDbTemplate,
) {

    fun save(favorite: DealershipFavoriteEntity) : DealershipFavoriteEntity {
        return dynamoDbTemplate.save(favorite)
    }

    fun getById(dealershipId: String, usr: UserAuthenticate) : DealershipFavoriteEntity? {
        val expressionValues = mapOf(
            ":dealershipId" to AttributeValue.fromS(dealershipId),
            ":accountId" to AttributeValue.fromS(usr.accountId)
        )

        val filterExpression = Expression
            .builder()
            .expression("accountId = :accountId and dealershipId = :dealershipId")
            .expressionValues(expressionValues)
            .build()

        val pageIterate = dynamoDbTemplate.scan(
            ScanEnhancedRequest.builder().filterExpression(filterExpression).build(),
            DealershipFavoriteEntity::class.java
        )

        return pageIterate.items().firstOrNull()
    }

    fun listAll(user:UserAuthenticate): List<DealershipFavoriteEntity> {
        val scanEnhancedRequest = ScanEnhancedRequest
            .builder()
            .filterExpression(
                Expression
                    .builder()
                    .expressionValues(
                        mapOf(
                            ":favorite" to AttributeValue.builder().bool(true).build(),
                            ":accountId" to AttributeValue.builder().s(user.accountId).build()
                        )
                    )
                    .expression("favorite = :favorite and accountId = :accountId")
                    .build()
            )
            .build()

        return dynamoDbTemplate.scan(scanEnhancedRequest, DealershipFavoriteEntity::class.java).map {
            return it.items()
        }
    }

}