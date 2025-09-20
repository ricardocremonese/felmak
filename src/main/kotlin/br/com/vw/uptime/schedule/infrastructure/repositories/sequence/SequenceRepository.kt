package br.com.vw.uptime.schedule.infrastructure.repositories.sequence

import br.com.vw.uptime.schedule.core.configs.NormalizeDynamoDbTableNameResolver
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Repository
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import software.amazon.awssdk.services.dynamodb.model.ReturnValue


@Repository
class SequenceRepository(
    val dynamoDbClient:DynamoDbClient
) {

    @Value("\${aws.dynamodb.suffix}")
    lateinit var suffixTable:String

    fun tableName() = NormalizeDynamoDbTableNameResolver.tableWithEnv("sequences", suffixTable)

    fun nextSequenceRotation(sequenceName:String, maxSequence:Long) : Long {
        val candidateSequence = incrementNextSequence(sequenceName)
        if(candidateSequence > maxSequence) {
            setNextSequenceToZero(sequenceName, maxSequence)
            return incrementNextSequence(sequenceName)
        }
        return candidateSequence
    }

    private fun incrementNextSequence(sequenceName:String): Long {
        val response = dynamoDbClient.updateItem {
            it.tableName(tableName())
                .key(mapOf("name" to AttributeValue.fromS(sequenceName)))
                .updateExpression("SET lastId = if_not_exists(lastId, :zero) + :incr")
                .expressionAttributeValues(
                    mapOf(
                        ":zero" to AttributeValue.fromN("0"),
                        ":incr" to AttributeValue.fromN("1")
                    )
                )
                .returnValues(ReturnValue.UPDATED_NEW)
        }
        return response.attributes()["lastId"]?.n()?.toLong()!!
    }

    private fun setNextSequenceToZero(sequenceName: String, maxSequence: Long) {
        dynamoDbClient.updateItem {
            it.tableName(tableName())
            .key(mapOf("name" to AttributeValue.fromS(sequenceName)))
            .updateExpression("SET lastId = :zero")
            .conditionExpression("lastId > :maxSequence")
            .expressionAttributeValues(
                mapOf(
                    ":zero" to AttributeValue.fromN("0"),
                    ":maxSequence" to AttributeValue.fromN(maxSequence.toString())
                )
            )
        }
    }

}