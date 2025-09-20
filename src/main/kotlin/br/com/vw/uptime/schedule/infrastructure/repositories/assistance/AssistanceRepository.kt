package br.com.vw.uptime.schedule.infrastructure.repositories.assistance

import br.com.vw.uptime.schedule.core.models.Page
import br.com.vw.uptime.schedule.core.models.assistance.enums.AssistanceOccurrenceType
import br.com.vw.uptime.schedule.core.utils.DynamoUtils
import br.com.vw.uptime.schedule.infrastructure.entities.assistance.AssistanceEntity
import br.com.vw.uptime.schedule.infrastructure.services.assistance.AssistanceStateEnum
import io.awspring.cloud.dynamodb.DynamoDbTemplate
import org.springframework.stereotype.Repository
import software.amazon.awssdk.enhanced.dynamodb.Key
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest
import java.time.LocalDate

@Repository
class AssistanceRepository(
    private val dynamoDbTemplate: DynamoDbTemplate
) {

    fun save(assistanceEntity: AssistanceEntity) : AssistanceEntity {
        return dynamoDbTemplate.save(assistanceEntity)
    }

    fun getAssistanceById(assistanceId: String): AssistanceEntity? {
        val key = Key.builder().partitionValue(assistanceId).build()
        return dynamoDbTemplate.load(key, AssistanceEntity::class.java)
    }

    fun getAssistanceByChassis(chassis:String, limit:Int, encodedLastKey:String?) : Page<AssistanceEntity> {
        val queryEnhancedRequest  = QueryEnhancedRequest.builder().apply {
            DynamoUtils.decodeLastKeyAndAdd(this, encodedLastKey)
            limit(limit)
            queryConditional(QueryConditional.keyEqualTo(Key.builder().partitionValue(chassis).build()))
        }
        .build()

        val page = dynamoDbTemplate.query(queryEnhancedRequest, AssistanceEntity::class.java, AssistanceEntity.IDX_ASSISTANCE_CHASSIS).iterator().next()
        return Page(
            items = page.items(),
            lastKey = DynamoUtils.encodeLastKey(page.lastEvaluatedKey())
        )
    }

    fun getAssistanceByAssetActive(towerAssetId:String) : AssistanceEntity? {
        val queryEnhancedRequest  = QueryEnhancedRequest.builder().apply {
            queryConditional(
                QueryConditional.keyEqualTo(
                    Key.builder().partitionValue(towerAssetId).build()
                )
            )
        }.build()

        return dynamoDbTemplate.query(queryEnhancedRequest, AssistanceEntity::class.java, AssistanceEntity.IDX_ASSISTANCE_TOWER_ASSET_ID).flatMap {
            it.items()
        }.firstOrNull {
            it.state == AssistanceStateEnum.PD.name
        }
    }


    fun getAssistanceByChassisActive(chassis:String) : AssistanceEntity? {
        val queryEnhancedRequest  = QueryEnhancedRequest.builder().apply {
            queryConditional(QueryConditional.keyEqualTo(Key.builder().partitionValue(chassis).build()))
        }
        .build()

        return dynamoDbTemplate.query(queryEnhancedRequest, AssistanceEntity::class.java, AssistanceEntity.IDX_ASSISTANCE_CHASSIS).flatMap {
            it.items()
        }.firstOrNull {
            it.state == AssistanceStateEnum.PD.name
        }
    }

    fun getAssistanceByChassisList(chassisList:List<String>) : List<AssistanceEntity> {
        val assistanceEntityList = arrayListOf<AssistanceEntity>()
        for(chassis in chassisList) {
            val assistanceEntity = getAssistanceByChassis(chassis, 100, null).items
            if(assistanceEntity.isNotEmpty()) {
                assistanceEntityList.addAll(assistanceEntity)
            }
        }
        return assistanceEntityList
    }

    fun getAssistanceListByState(
        state: AssistanceStateEnum,
        limit: Int,
        encodedLastKey: String?,
        sortDirection: String?
    ): Page<AssistanceEntity> {
        val queryRequest = QueryEnhancedRequest
        .builder().apply {
            DynamoUtils.decodeLastKeyAndAdd(this, encodedLastKey)
            scanIndexForward(sortDirectionToForward(sortDirection))
            queryConditional(
                QueryConditional.keyEqualTo(
                    Key.builder().partitionValue(state.name).build()
                )
            )
            .limit(limit)
        }.build()
        val page = dynamoDbTemplate.query(queryRequest, AssistanceEntity::class.java, AssistanceEntity.IDX_ASSISTANCE_STATE).iterator().next()
        return Page(
            items = page.items(),
            lastKey = DynamoUtils.encodeLastKey(page.lastEvaluatedKey())
        )
    }

    fun getAssistanceListByStateAndDate(
        state: AssistanceStateEnum,
        date: LocalDate?,
        limit: Int,
        encodedLastKey: String?,
        sortDirection: String?
    ) : Page<AssistanceEntity> {
        val queryRequest = QueryEnhancedRequest
            .builder().apply {
                limit(limit)
                scanIndexForward(sortDirectionToForward(sortDirection))
                DynamoUtils.decodeLastKeyAndAdd(this, encodedLastKey)
                queryConditional(
                    QueryConditional.sortBeginsWith(
                        Key.builder()
                        .partitionValue(state.name)
                        .sortValue(date.toString())
                        .build()
                    )
                )
            }
            .build()
        val page = dynamoDbTemplate.query(queryRequest, AssistanceEntity::class.java, AssistanceEntity.IDX_ASSISTANCE_STATE).iterator().next()
        return Page(
            items = page.items(),
            lastKey = DynamoUtils.encodeLastKey(page.lastEvaluatedKey())
        )
    }

    fun getAssistanceListByOccurrenceType(
        occurrenceType: AssistanceOccurrenceType,
        state: AssistanceStateEnum?,
        date: LocalDate?,
        limit: Int,
        encodedLastKey: String?,
        sortDirection: String?
    ): Page<AssistanceEntity> {
        val queryRequest = QueryEnhancedRequest
            .builder().apply {
                DynamoUtils.decodeLastKeyAndAdd(this, encodedLastKey)
                scanIndexForward(sortDirectionToForward(sortDirection))
                queryConditional(
                    DynamoUtils.addFullSortKey(listOf(state?.name, date?.toString())).let {
                        if(it.isEmpty()) {
                            QueryConditional.keyEqualTo(
                                Key.builder().apply {
                                    partitionValue(occurrenceType.type)
                                }.build()
                            )
                        } else {
                            QueryConditional.sortBeginsWith(
                                Key.builder().apply {
                                    partitionValue(occurrenceType.type)
                                    sortValue(it)
                                }.build()
                            )
                        }
                    }
                )
                    .limit(limit)
            }.build()
        val page = dynamoDbTemplate.query(queryRequest, AssistanceEntity::class.java, AssistanceEntity.IDX_ASSISTANCE_OCCUR_TYPE_CREATED_DATE).iterator().next()
        return Page(
            items = page.items(),
            lastKey = DynamoUtils.encodeLastKey(page.lastEvaluatedKey())
        )
    }

    /**
     * true === ascending
     * false === descending
     */
    private fun sortDirectionToForward(sortDirection: String?): Boolean {
        if(sortDirection == null) {
            return true
        }
        if(sortDirection == "desc") {
            return false
        }
        return true
    }
}