package br.com.vw.uptime.schedule.infrastructure.repositories.users

import br.com.vw.uptime.schedule.core.configs.properties.AwsProperties
import br.com.vw.uptime.schedule.infrastructure.entities.user.UserProfileEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.AbstractRepository
import org.springframework.stereotype.Repository
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient
import software.amazon.awssdk.enhanced.dynamodb.Key
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest

@Repository
class UserProfileRepository(dynamoDbTemplate: DynamoDbEnhancedClient, config: AwsProperties) :
    AbstractRepository<UserProfileEntity>(
        TABLE_NAME,
        dynamoDbTemplate,
        UserProfileEntity::class.java,
        config,) {

    companion object {
        private const val TABLE_NAME = "userProfile"
    }

    fun findByAccountAndGroups(accountId: String, groupsId: List<String>): List<UserProfileEntity> {
        var keyBuilder = Key.builder().partitionValue(accountId)
        groupsId.forEach { keyBuilder.sortValue(it) }
        return getItems(QueryEnhancedRequest.builder().queryConditional(QueryConditional.keyEqualTo(keyBuilder.build())).build())
    }
}