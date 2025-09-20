package br.com.vw.uptime.schedule.infrastructure.entities.maintenance

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey
import java.time.LocalDateTime

@DynamoDbBean
class EngineModelEntity {

    companion object {
        const val ENGINE_MODEL_GSI_DIG45 = "engine_model_gsi_dig45"
    }

    @get:DynamoDbPartitionKey
    @get:DynamoDbAttribute("id")
    lateinit var id: String

    @get:DynamoDbAttribute("dig45")
    @get:DynamoDbSecondaryPartitionKey(indexNames = [ENGINE_MODEL_GSI_DIG45])
    lateinit var dig45: String

    @get:DynamoDbAttribute("dig6")
    var dig6: String? = null

    @get:DynamoDbAttribute("dig78")
    var dig78: String? = null

    @get:DynamoDbAttribute("dig9")
    var dig9: String? = null

    @get:DynamoDbAttribute("dig10")
    var dig10: String? = null

    @get:DynamoDbAttribute("dig11")
    var dig11: String? = null

    @get:DynamoDbAttribute("dig1217")
    var dig1217: String? = null

    @get:DynamoDbAttribute("engine")
    lateinit var engine: String

    @get:DynamoDbAttribute("emissionStandard")
    lateinit var emissionStandard: String

    @get:DynamoDbAttribute("cc")
    var cc: String? = null

    @get:DynamoDbAttribute("createdAt")
    lateinit var createdAt: LocalDateTime
}