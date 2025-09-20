package br.com.vw.uptime.schedule.infrastructure.repositories.checkup

import br.com.vw.uptime.schedule.core.enums.checkups.CheckupScheduleState
import br.com.vw.uptime.schedule.core.enums.schedule.ScheduleStateEnum
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.core.models.Page
import br.com.vw.uptime.schedule.core.utils.DynamoPaging
import br.com.vw.uptime.schedule.core.utils.DynamoUtils
import br.com.vw.uptime.schedule.infrastructure.entities.checkup.CheckupScheduleEntity
import io.awspring.cloud.dynamodb.DynamoDbTemplate
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Repository
import software.amazon.awssdk.enhanced.dynamodb.Expression
import software.amazon.awssdk.enhanced.dynamodb.Key
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.YearMonth

@Repository
class CheckupScheduleRepository(
    private val dynamoDbTemplate: DynamoDbTemplate,
) {

    companion object {
        const val table = "checkup_schedule"
        const val IDX_CHECKUP_SCHEDULE_ACCOUNT_ID = "checkup_schedule_account_id"
        const val IDX_CHECKUP_SCHEDULE_ASSET_ID = "checkup_schedule_asset_id"

        const val IDX_CHECKUP_SCHEDULE_TOWER_ACCOUNT_ID = "checkup_schedule_tower_account_id"
        const val IDX_CHECKUP_SCHEDULE_TOWER_ASSET_ID = "checkup_schedule_tower_asset_id"

        const val IDX_CHECKUP_SCHEDULE_CHASSIS = "checkup_schedule_chassis"

        const val IDX_CHECKUP_SCHEDULE_DEALERSHIP_ID = "checkup_schedule_dealership_id"
    }

    @Value("\${tower-account-id}")
    private lateinit var controlTowerAccountId: String

    fun createCheckupSchedule(checkupScheduleEntity:CheckupScheduleEntity) : CheckupScheduleEntity {
        return dynamoDbTemplate.save(checkupScheduleEntity)
    }

    fun updateCheckupSchedule(checkupScheduleEntity:CheckupScheduleEntity) : CheckupScheduleEntity {
        return dynamoDbTemplate.update(checkupScheduleEntity)
    }

    fun getCheckupScheduleById(checkupScheduleById:String) : CheckupScheduleEntity? {
        return dynamoDbTemplate.load(
            Key
            .builder()
            .partitionValue(checkupScheduleById)
            .build(),
            CheckupScheduleEntity::class.java
        )
    }

    fun getCheckupSchedulesByIds(ids: List<String>): List<CheckupScheduleEntity> {
        val expressionValues = ids.mapIndexed { index, id ->
            ":id$index" to AttributeValue.fromS(id)
        }.toMap()

        // Constrói a expressão "id IN (:id0, :id1, :id2, ...)"
        val filterExpressionString = "id IN (${expressionValues.keys.joinToString(", ")})"

        val filterExpression = Expression
            .builder()
            .expression(filterExpressionString)
            .expressionValues(expressionValues)
            .build()

        val pageIterate = dynamoDbTemplate.scan(
            ScanEnhancedRequest.builder().filterExpression(filterExpression).build(),
            CheckupScheduleEntity::class.java
        )

        return pageIterate.toList().flatMap { it.items() }
    }

    fun checkupScheduleByVehicleChassis(chassis:String) : List<CheckupScheduleEntity> {
        val expressionValues = mapOf(
            ":state" to AttributeValue.fromS(ScheduleStateEnum.REJECTED.state()),
        )

        val expressionNames = mapOf(
            "#state" to "state"
        )
        val filterExpression = Expression
            .builder()
            .expression("schedule.#state <> :state")
            .expressionValues(expressionValues)
            .expressionNames(expressionNames)
            .build()

        val queryEnhancedRequest = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.keyEqualTo(Key.builder().partitionValue(chassis).build()))
            .filterExpression(filterExpression)
            .build()

        val queryResponse = dynamoDbTemplate.query(queryEnhancedRequest, CheckupScheduleEntity::class.java, IDX_CHECKUP_SCHEDULE_CHASSIS)

        return queryResponse.items().toList()
    }

    fun getCheckupScheduleByChassisAndState(chassis: String, state: String): List<CheckupScheduleEntity> {
        val filterExpression = Expression
            .builder()
            .expression("schedule.#state <> :state")
            .expressionValues(mapOf(":state" to AttributeValue.fromS(state)))
            .expressionNames(mapOf("#state" to "state"))
            .build()

        val queryEnhancedRequest = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.keyEqualTo(Key.builder().partitionValue(chassis).build()))
            .filterExpression(filterExpression)
            .build()

        val queryResponse = dynamoDbTemplate.query(queryEnhancedRequest, CheckupScheduleEntity::class.java, IDX_CHECKUP_SCHEDULE_CHASSIS)
        return queryResponse.items().toList()
    }

    fun checkupScheduleByVehicleChassisList(chassisList: List<String>): List<CheckupScheduleEntity> {
        val expressionValues = mapOf(
            ":state" to AttributeValue.fromS(ScheduleStateEnum.REJECTED.state())
        )

        val expressionNames = mapOf(
            "#state" to "state"
        )

        val chassisCondition = chassisList.joinToString(" or ") { "vehicleSchedule.vehicle.chassis = :$it" } + " or vehicleSchedule.vehicle.chassis = :dash"
        val expressionValuesWithChassis = expressionValues + chassisList.map { ":$it" to AttributeValue.fromS(it) }.toMap() + (":dash" to AttributeValue.fromS("-"))

        val filterExpression = Expression
            .builder()
            .expression("($chassisCondition) and schedule.#state <> :state")
            .expressionValues(expressionValuesWithChassis)
            .expressionNames(expressionNames)
            .build()

        val pageIterate = dynamoDbTemplate.scan(
            ScanEnhancedRequest.builder().filterExpression(filterExpression).build(),
            CheckupScheduleEntity::class.java
        )
        return pageIterate.toList().first().items()
    }

    fun checkupScheduleByAssetId(assetId:String, user: UserAuthenticate) : List<CheckupScheduleEntity> {
        val expressionValues = mapOf(
            ":assetId" to AttributeValue.fromS(assetId),
            ":state" to AttributeValue.fromS(ScheduleStateEnum.REJECTED.state()),
            ":accountId" to AttributeValue.fromS(user.accountId)
        )

        val expressionNames = mapOf(
            "#state" to "state"
        )
        val filterExpression = Expression
            .builder()
            .expression("schedule.sourceAccountId = :accountId and vehicleSchedule.vehicle.assetId = :assetId and schedule.#state <> :state")
            .expressionValues(expressionValues)
            .expressionNames(expressionNames)
            .build()

        val pageIterate = dynamoDbTemplate.scan(
            ScanEnhancedRequest.builder().filterExpression(filterExpression).build(),
            CheckupScheduleEntity::class.java
        )
        val checkupSchedules = pageIterate.toList().first().items()
        return checkupSchedules
    }

    fun checkupScheduleByAssetIdAndCheckupId(assetId:String, checkupId:String, user: UserAuthenticate) : CheckupScheduleEntity? {
        val expressionValues = mapOf(
            ":assetId" to AttributeValue.fromS(assetId),
            ":checkupId" to AttributeValue.fromS(checkupId),
            ":state" to AttributeValue.fromS(ScheduleStateEnum.REJECTED.state()),
            ":accountId" to AttributeValue.fromS(user.accountId)
        )

        val expressionNames = mapOf(
            "#state" to "state"
        )
        val filterExpression = Expression
            .builder()
            .expression("schedule.sourceAccountId = :accountId and vehicleSchedule.vehicle.assetId = :assetId and checkupId = :checkupId and schedule.#state <> :state")
            .expressionValues(expressionValues)
            .expressionNames(expressionNames)
            .build()

        val pageIterate = dynamoDbTemplate.scan(
            ScanEnhancedRequest.builder().filterExpression(filterExpression).build(),
            CheckupScheduleEntity::class.java
        )
        val checkupSchedules = pageIterate.toList().first().items()
        return checkupSchedules.firstOrNull()
    }

    fun checkupScheduleByMonth(month:Int, year:Int, user: UserAuthenticate) : List<CheckupScheduleEntity> {
        val yearMonth = YearMonth.of(year, month)
        val startDate = yearMonth.atDay(1)
        val endDate = yearMonth.atEndOfMonth()
        val expressionValues = mapOf(
            ":startDate" to AttributeValue.fromS(startDate.toString()),
            ":endDate" to AttributeValue.fromS(endDate.toString()),
            ":accountId" to AttributeValue.fromS(user.accountId),
            ":state" to AttributeValue.fromS(ScheduleStateEnum.REJECTED.state())
        )

        val expressionAttributeValue = mapOf(
            "#state" to "state"
        )

        val filterExpression = Expression
            .builder()
            .expression("schedule.sourceAccountId = :accountId and schedule.scheduledDate between :startDate and :endDate and schedule.#state <> :state")
            .expressionNames(expressionAttributeValue)
            .expressionValues(expressionValues)
            .build()

        val pageIterate = dynamoDbTemplate.scan(
            ScanEnhancedRequest.builder().filterExpression(filterExpression).build(),
            CheckupScheduleEntity::class.java
        )
        return pageIterate.first().items()
    }

    fun checkupScheduleByDateAndConsultant(startDate: LocalDateTime, endDate: LocalDateTime, dealershipId:String):
            List<CheckupScheduleEntity> {

        val results = listOf(
            CheckupScheduleState.PENDING.state,
            CheckupScheduleState.CANCELED.state
        ).flatMap {
            val queryRequest = QueryEnhancedRequest.builder()
                .queryConditional(
                    QueryConditional.sortBetween(
                        Key.builder().partitionValue(dealershipId)
                            .sortValue(DynamoUtils.addFullSortKey(arrayListOf(it, startDate.toString())))
                            .build(),
                        Key.builder().partitionValue(dealershipId)
                            .sortValue(DynamoUtils.addFullSortKey(arrayListOf(it, endDate.toString())))
                            .build(),
                    )
                )
                .build()

            val pageIterate = dynamoDbTemplate.query(
                queryRequest,
                CheckupScheduleEntity::class.java,
                IDX_CHECKUP_SCHEDULE_DEALERSHIP_ID
            )
            pageIterate.flatMap {
                it.items()
            }
        }
        return results
    }

    fun checkupScheduleByDateAndConsultantAndState(startDate: LocalDateTime, endDate: LocalDateTime, dealershipId:String, consultantId:String, state: CheckupScheduleState):
            List<CheckupScheduleEntity> {

        val expressionValues = mapOf(
            ":consultantId" to AttributeValue.fromS(consultantId)
        )

        val filterExpression = Expression
            .builder()
            .expression("consultant.id = :consultantId")
            .expressionValues(expressionValues)
            .build()


        val queryRequest = QueryEnhancedRequest.builder()
            .queryConditional(
                QueryConditional.sortBetween(
                    Key.builder().partitionValue(dealershipId)
                        .sortValue(DynamoUtils.addFullSortKey(arrayListOf(state.state, startDate.toString())))
                        .build(),
                    Key.builder().partitionValue(dealershipId)
                        .sortValue(DynamoUtils.addFullSortKey(arrayListOf(state.state, endDate.toString())))
                        .build(),
                )
            ).filterExpression(
                filterExpression
            )
            .build()

        val pageIterate = dynamoDbTemplate.query(
            queryRequest,
            CheckupScheduleEntity::class.java,
            IDX_CHECKUP_SCHEDULE_DEALERSHIP_ID
        )
        return pageIterate.flatMap {
            it.items()
        }
    }

    fun getSchedulesByAccountId(accountId:String) : List<CheckupScheduleEntity> {
        val expressionValues = mapOf(
            ":accountId" to AttributeValue.fromS(accountId),
            ":state" to AttributeValue.fromS(ScheduleStateEnum.REJECTED.state())
        )

        val expressionAttributeValue = mapOf(
            "#state" to "state"
        )

        val filterExpression = Expression
            .builder()
            .expression("schedule.sourceAccountId = :accountId and schedule.#state <> :state")
            .expressionValues(expressionValues)
            .expressionNames(expressionAttributeValue)
            .build()

        return getSchedules(filterExpression)
    }

    fun getSchedulesByUserIdAndStartDate(userId:String, startDate: LocalDateTime) : List<CheckupScheduleEntity> {
        val expressionValues = mapOf(
            ":startDate" to AttributeValue.fromS(startDate.toString()),
            ":consultantId" to AttributeValue.fromS(userId),
            ":state" to AttributeValue.fromS(ScheduleStateEnum.REJECTED.state())
        )

        val expressionAttributeValue = mapOf(
            "#state" to "state"
        )

        val filterExpression = Expression
            .builder()
            .expression("consultant.id = :consultantId and schedule.#state <> :state and schedule.scheduledDate >= :startDate")
            .expressionValues(expressionValues)
            .expressionNames(expressionAttributeValue)
            .build()

        return getSchedules(filterExpression)
    }

    private fun getSchedules(filterExpression: Expression) : List<CheckupScheduleEntity> {

        val pageIterate = dynamoDbTemplate.scan(
            ScanEnhancedRequest.builder().filterExpression(filterExpression).build(),
            CheckupScheduleEntity::class.java
        )

        return pageIterate.first().items();
    }

    fun getSchedulesByUser(user: UserAuthenticate): List<CheckupScheduleEntity> {
        val expressionValues = mapOf(
            ":accountId" to AttributeValue.fromS(user.accountId),
            ":userId" to AttributeValue.fromS(user.userId),
            ":state" to AttributeValue.fromS(ScheduleStateEnum.REJECTED.state())
        )

        val expressionAttributeValue = mapOf(
            "#state" to "state"
        )

        val filterExpression = Expression
            .builder()
            .expression("schedule.sourceAccountId = :accountId and schedule.sourceUserId = :userId and schedule.#state <> :state")
            .expressionValues(expressionValues)
            .expressionNames(expressionAttributeValue)
            .build()

        return getSchedules(filterExpression)
    }

    fun getSchedulesByConsultantUser(user: UserAuthenticate, pageNumber:Int, limit:Int, wasViewed: Boolean) : List<CheckupScheduleEntity> {
        val expressionValues = mapOf(
            ":accountId" to AttributeValue.fromS(user.accountId),
            ":userId" to AttributeValue.fromS(user.userId),
            ":state" to AttributeValue.fromS(ScheduleStateEnum.REJECTED.state()),
            ":wasViewed" to AttributeValue.fromBool(wasViewed),
        )

        val expressionAttributeValue = mapOf(
            "#state" to "state"
        )

        val filterExpression = Expression
            .builder()
            .expression("schedule.destinationAccountId = :accountId and schedule.destinationUserId = :userId and schedule.#state <> :state and wasViewed = :wasViewed")
            .expressionValues(expressionValues)
            .expressionNames(expressionAttributeValue)
            .build()

        val scanBuilder = ScanEnhancedRequest.builder()
            .filterExpression(filterExpression)
            .limit(limit)

        return DynamoPaging(dynamoDbTemplate).paginateResults<CheckupScheduleEntity>(pageNumber, scanBuilder)
    }

    fun getSchedulesByConsultant(
        dealershipId: String,
        checkupScheduleState: CheckupScheduleState? = null,
        scheduledDate: LocalDate? = null,
        limit: Int,
        sortDirection:String?,
        encodedLastKey:String?
    ): Page<CheckupScheduleEntity> {
        val queryRequest = DynamoUtils.createQueryDefault(
            partitionValue = dealershipId,
            sortKeys = listOf(checkupScheduleState?.state, scheduledDate?.toString()),
            sortDirection = DynamoUtils.sortDirectionToForward(sortDirection),
            limit = limit,
            encodedLastKey = encodedLastKey
        ).build()

        val pageIterate = dynamoDbTemplate.query(
            queryRequest,
            CheckupScheduleEntity::class.java,
            IDX_CHECKUP_SCHEDULE_DEALERSHIP_ID
        )
        val page = pageIterate.iterator().next()
        val lastKey = page.lastEvaluatedKey()
        return Page(
            items = page.items(),
            lastKey = DynamoUtils.encodeLastKey(lastKey)
        )
    }



    fun getAllActiveCheckupSchedule(pageNumber: Int, limit: Int): List<CheckupScheduleEntity> {
        require(pageNumber > 0) { "Page number must be greater than 0" }
        require(limit > 0) { "Limit must be greater than 0" }

        val expressionValues = mapOf<String, AttributeValue>(
            ":state" to AttributeValue.fromS(ScheduleStateEnum.REJECTED.state())
        )

        val expressionAttributeValue = mapOf(
            "#state" to "state"
        )

        val filterExpression = Expression
            .builder()
            .expression("schedule.#state <> :state")
            .expressionValues(expressionValues)
            .expressionNames(expressionAttributeValue)
            .build()

        val scanRequestBuilder = ScanEnhancedRequest.builder()
            .filterExpression(filterExpression)
            .limit(limit) // Fetch only the number of items per page
        var lastEvaluatedKey: Map<String, AttributeValue>? = null

        var currentPage = 1
        var results: List<CheckupScheduleEntity> = emptyList()

        while (currentPage <= pageNumber) {
            val scanRequest = if (lastEvaluatedKey != null) {
                scanRequestBuilder.exclusiveStartKey(lastEvaluatedKey).build()
            } else {
                scanRequestBuilder.build()
            }

            val page = dynamoDbTemplate.scan(scanRequest, CheckupScheduleEntity::class.java).first()

            if (currentPage == pageNumber) {
                // Collect the desired page results
                results = page.items()
            }

            // Update LastEvaluatedKey for the next iteration
            lastEvaluatedKey = page.lastEvaluatedKey()

            // If no more results and the requested page is not reached
            if (lastEvaluatedKey == null && currentPage < pageNumber) {
                throw IllegalArgumentException("Page number exceeds the total number of pages")
            }

            currentPage++
        }

        return results
    }

    fun getCheckupScheduleIdByAssetId(assetId: String): List<CheckupScheduleEntity> {

        val queryEnhancedRequest  = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional
            .keyEqualTo(Key.builder().partitionValue(assetId).build()))
            .build()

        val queryResponse = dynamoDbTemplate.query(queryEnhancedRequest, CheckupScheduleEntity::class.java, IDX_CHECKUP_SCHEDULE_ASSET_ID)

        return queryResponse.items().toList()
    }

    fun getCheckupScheduleIdByTowerAssetId(assetId: String, scheduledDate:LocalDate? = null): List<CheckupScheduleEntity> {

        val queryEnhancedRequest  = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional
                .keyEqualTo(Key.builder().partitionValue(assetId).build()))
            .build()

        val queryResponse = dynamoDbTemplate.query(queryEnhancedRequest, CheckupScheduleEntity::class.java, IDX_CHECKUP_SCHEDULE_TOWER_ASSET_ID)

        return queryResponse.items().toList()
    }

    fun getCheckupScheduleByDealershipId(dealershipId:String): List<CheckupScheduleEntity> {

        val expressionValues = mapOf(
            ":state" to AttributeValue.fromS(ScheduleStateEnum.REJECTED.state()),
        )

        val expressionAttributeValue = mapOf(
            "#state" to "state"
        )

        val queryEnhancedRequest  = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional
                .keyEqualTo(Key.builder().partitionValue(dealershipId).build()))
            .filterExpression(Expression
                .builder()
                .expression("schedule.#state <> :state")
                .expressionValues(expressionValues)
                .expressionNames(expressionAttributeValue)
                .build())
            .build()

        val queryResponse = dynamoDbTemplate.query(queryEnhancedRequest, CheckupScheduleEntity::class.java, IDX_CHECKUP_SCHEDULE_DEALERSHIP_ID)

        return queryResponse.flatMap {
            it.items()
        }
    }

    fun getCheckupScheduleByAccountId(accountId:String): List<CheckupScheduleEntity> {

        val expressionValues = mapOf(
            ":state" to AttributeValue.fromS(ScheduleStateEnum.REJECTED.state()),
        )

        val expressionAttributeValue = mapOf(
            "#state" to "state"
        )

        val queryEnhancedRequest  = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional
                .keyEqualTo(Key.builder().partitionValue(accountId).build()))
            .filterExpression(Expression
                .builder()
                .expression("schedule.#state <> :state")
                .expressionValues(expressionValues)
                .expressionNames(expressionAttributeValue)
                .build())
            .build()

        val queryResponse = dynamoDbTemplate.query(queryEnhancedRequest, CheckupScheduleEntity::class.java, IDX_CHECKUP_SCHEDULE_ACCOUNT_ID)

        return queryResponse.flatMap {
            it.items()
        }
    }

    fun getCheckupScheduleByTowerAccountId(
        accountId: String,
        checkupScheduleState: CheckupScheduleState? = null
    ): List<CheckupScheduleEntity> {

        val queryRequest = DynamoUtils.createQueryDefault(
            partitionValue = accountId
        ).build()

        val pageIterate = dynamoDbTemplate.query(
            queryRequest,
            CheckupScheduleEntity::class.java,
            IDX_CHECKUP_SCHEDULE_TOWER_ACCOUNT_ID
        )
        return pageIterate.flatMap {
            it.items()
        }
    }

    fun getCheckupScheduleByTowerAccountIdAndState(
        accountId: String,
        checkupScheduleState: CheckupScheduleState? = null,
        scheduledDate: LocalDate? = null,
        month: Int? = null,
        year: Int? = null,
        limit: Int? = null,
        sortDirection:String? = null,
        encodedLastKey:String? = null
    ): Page<CheckupScheduleEntity> {

        val queryRequestBuilder = DynamoUtils.createQueryDefault(
            partitionValue = accountId,
            sortKeys = listOf(checkupScheduleState?.state),
            sortDirection = DynamoUtils.sortDirectionToForward(sortDirection),
            limit = limit,
            encodedLastKey = encodedLastKey
        )

        if (month != null && year != null) {
            val yearMonth = YearMonth.of(year, month)
            val startDate = yearMonth.atDay(1).atStartOfDay()
            val endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59)
            
            val queryConditional = QueryConditional.sortBetween(
                Key.builder().partitionValue(accountId)
                    .sortValue(DynamoUtils.addFullSortKey(arrayListOf(checkupScheduleState?.state, startDate.toString())))
                    .build(),
                Key.builder().partitionValue(accountId)
                    .sortValue(DynamoUtils.addFullSortKey(arrayListOf(checkupScheduleState?.state, endDate.toString())))
                    .build()
            )
            queryRequestBuilder.queryConditional(queryConditional)
        }

        val queryRequest = queryRequestBuilder.build()

        val pageIterate = dynamoDbTemplate.query(
            queryRequest,
            CheckupScheduleEntity::class.java,
            if(accountId == controlTowerAccountId)
                IDX_CHECKUP_SCHEDULE_TOWER_ACCOUNT_ID
            else
                IDX_CHECKUP_SCHEDULE_ACCOUNT_ID
        )
        val page = pageIterate.iterator().next()
        val lastKey = page.lastEvaluatedKey()
        return Page(
            items = page.items(),
            lastKey = DynamoUtils.encodeLastKey(lastKey)
        )
    }

    fun getCheckupScheduleChassis(chassis: String): List<CheckupScheduleEntity> {

        val queryEnhancedRequest  = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.keyEqualTo(Key.builder().partitionValue(chassis).build()))
            .limit(1)
            .build()

        val queryResponse = dynamoDbTemplate.query(queryEnhancedRequest, CheckupScheduleEntity::class.java, IDX_CHECKUP_SCHEDULE_CHASSIS)

        return queryResponse.items().toList()
    }

    fun allCheckupSchedules() : List<CheckupScheduleEntity> {

        val pageIterate = dynamoDbTemplate.scan(
            ScanEnhancedRequest.builder().build(),
            CheckupScheduleEntity::class.java
        )
        val checkupSchedules = pageIterate.flatMap {
            it.items()
        }

        return checkupSchedules
    }
}