package br.com.vw.uptime.schedule.core.utils

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import software.amazon.awssdk.enhanced.dynamodb.Key
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import software.amazon.awssdk.services.dynamodb.model.UpdateItemRequest
import java.util.*

class DynamoUtils {

    companion object {

        private val objectMapper = jacksonObjectMapper()

        fun buildUpdateRequest(
            tableName: String,
            key: Map<String, AttributeValue>,
            updates: Map<String, AttributeValue?>
        ): UpdateItemRequest {
            val expressionAttributeNames = mutableMapOf<String, String>()
            val expressionAttributeValues = mutableMapOf<String, AttributeValue>()
            val updateExpressions = mutableListOf<String>()

            updates.forEach { (attrName, value) ->
                val nameKey = "#$attrName"
                val valueKey = ":$attrName"
                expressionAttributeNames[nameKey] = attrName
                expressionAttributeValues[valueKey] = value ?: AttributeValue.fromNul(true)
                updateExpressions.add("$nameKey = $valueKey")
            }

            return UpdateItemRequest.builder()
                .tableName(tableName)
                .key(key)
                .updateExpression("SET ${updateExpressions.joinToString(", ")}")
                .expressionAttributeNames(expressionAttributeNames)
                .expressionAttributeValues(expressionAttributeValues)
                .build()
        }

        fun strOrNull(str:String?) : AttributeValue {
            if(str != null) {
                return AttributeValue.fromS(str)
            }
            return AttributeValue.fromNul(true)
        }

        fun encodeLastKey(key: Map<String, AttributeValue>?): String? {
            if (key == null) return null
            val json = serializeLastEvaluatedKey(key)
            return Base64.getEncoder().encodeToString(json.toByteArray())
        }

        fun decodeLastKey(token: String?): Map<String, AttributeValue>? {
            if (token == null) return null
            val jsonBytes = Base64.getDecoder().decode(token)
            return deserializeLastEvaluatedKey(String(jsonBytes))
        }

        fun decodeLastKeyAndAdd(builderQueryRequest:QueryEnhancedRequest.Builder, encodedLastKey:String?) {
            if(!encodedLastKey.isNullOrBlank()) {
                val lastKey = decodeLastKey(encodedLastKey)!!
                builderQueryRequest.exclusiveStartKey(lastKey)
            }
        }

        fun serializeLastEvaluatedKey(lastEvaluatedKey: Map<String, AttributeValue>): String {
            val simpleMap = lastEvaluatedKey.mapValues { (_, value) ->
                when {
                    value.s() != null -> value.s()
                    value.n() != null -> value.n()
                    value.bool() != null -> value.bool()
                    value.hasL() -> value.l().map { it.s() ?: it.n() ?: it.toString() } // customize as needed
                    value.hasM() -> value.m().mapValues { it.value.s() ?: it.value.n() ?: it.value.toString() }
                    else -> value.toString() // fallback
                }
            }
            return objectMapper.writeValueAsString(simpleMap)
        }

        fun deserializeLastEvaluatedKey(json: String): Map<String, AttributeValue> {
            val mapper = objectMapper
            val rawMap: Map<String, Any> = mapper.readValue(json, Map::class.java) as Map<String, Any>

            return rawMap.mapValues { (_, value) ->
                when (value) {
                    is String -> AttributeValue.builder().s(value).build()
                    is Boolean -> AttributeValue.builder().bool(value).build()
                    is Int, is Long, is Double, is Float -> AttributeValue.builder().n(value.toString()).build()
                    else -> throw IllegalArgumentException("Unsupported type for AttributeValue: ${value::class}")
                }
            }
        }

        fun addFullSortKey(sortKeyPartList: List<String?>): String {
            val fullSortKey = StringBuilder()
            for(sortKeyCompPart in sortKeyPartList) {
                if(sortKeyCompPart.isNullOrBlank()) {
                    continue
                }
                if(fullSortKey.isEmpty()) {
                    fullSortKey.append(sortKeyCompPart)
                } else {
                    fullSortKey.append("#$sortKeyCompPart")
                }
            }
            return fullSortKey.toString()
        }

        fun createQueryDefault(
            partitionValue:String,
            sortKeys:List<String?> = listOf(),
            sortDirection:Boolean = true,
            encodedLastKey: String? = null,
            limit:Int? = null
        ): QueryEnhancedRequest.Builder {
            return QueryEnhancedRequest
                .builder().apply {
                    decodeLastKeyAndAdd(this, encodedLastKey)
                    scanIndexForward(sortDirection)
                    queryConditional(
                        addFullSortKey(sortKeys).let {
                            if(it.isEmpty()) {
                                QueryConditional.keyEqualTo(
                                    Key.builder().apply {
                                        partitionValue(partitionValue)
                                    }.build()
                                )
                            } else {
                                QueryConditional.sortBeginsWith(
                                    Key.builder().apply {
                                        partitionValue(partitionValue)
                                        sortValue(it)
                                    }.build()
                                )
                            }
                        }
                    )
                    if(limit != null) {
                        limit(limit)
                    }
                }
        }

        /**
         * true === ascending
         * false === descending
         */
        fun sortDirectionToForward(sortDirection: String?): Boolean {
            if(sortDirection == null) {
                return true
            }
            if(sortDirection == "desc") {
                return false
            }
            return true
        }
    }
}