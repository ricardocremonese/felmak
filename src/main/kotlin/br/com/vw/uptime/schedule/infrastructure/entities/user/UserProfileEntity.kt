package br.com.vw.uptime.schedule.infrastructure.entities.user

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey

@DynamoDbBean
class UserProfileEntity {
    @get:DynamoDbPartitionKey
    lateinit var accountId: String

    @get:DynamoDbSortKey
    lateinit var groupId: String

    var role: String? = null

    var occurrencePermissions: Map<String, String>? = null
}