package br.com.vw.uptime.schedule.infrastructure.entities.asset

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey
import java.time.LocalDateTime

@DynamoDbBean
class AssetEntity {

    companion object {
        const val IDX_ASSET_IDENTIFICATION = "asset_identification"
    }

    @get:DynamoDbSortKey
    var id: String? = null
    @get:DynamoDbPartitionKey
    var accountId: String? = null
    var name: String = ""
    var status: String = ""
    var type: String = ""
    @get:DynamoDbSecondaryPartitionKey(indexNames = [IDX_ASSET_IDENTIFICATION])
    var identification: String? = null
    var identificationType: String? = null
    var brand: String? = null
    var licensePlate: String? = null
    var licensePlateCountryCode: String? = null
    var embedded: EmbeddedEntity? = null
    var updatedAt: LocalDateTime? = null
}

@DynamoDbBean
class EmbeddedEntity {
    var masterData: MasterDataEntity? = null
    var tags: TagsEntity? = null
}

@DynamoDbBean
class MasterDataEntity {
    var vehicleModel: String? = null
}

@DynamoDbBean
class TagsEntity {
    var items: List<GroupFleetIdDataEntity> = listOf()
}

@DynamoDbBean
class GroupFleetIdDataEntity {
    var id: String = ""
}