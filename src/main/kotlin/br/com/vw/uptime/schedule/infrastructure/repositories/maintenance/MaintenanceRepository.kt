package br.com.vw.uptime.schedule.infrastructure.repositories.maintenance

import br.com.vw.uptime.schedule.core.enums.schedule.InviterType
import br.com.vw.uptime.schedule.core.models.Page
import br.com.vw.uptime.schedule.core.models.maintenance.ticket.TicketStatusGroup
import br.com.vw.uptime.schedule.core.utils.DynamoUtils
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.FieldCampaignTicketEntity.Companion.IDX_MAINTENANCE_TICKET_CHASSIS
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.FieldCampaignTicketEntity.Companion.IDX_MAINTENANCE_TICKET_CHECKUP_SCHEDULE
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.FieldCampaignTicketEntity.Companion.IDX_MAINTENANCE_TICKET_DESTINATION_USER_ID
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.FieldCampaignTicketEntity.Companion.IDX_MAINTENANCE_TICKET_SOURCE_ACCOUNT_ID
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.MaintenanceTicketEntity
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
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
import java.util.*


@Repository
class MaintenanceRepository(
    private val dynamoDbTemplate: DynamoDbTemplate,
    private val userAuthServiceImpl: UserAuthServiceImpl) {

    @Value("\${tower-account-id}")
    private lateinit var controlTowerAccountId: String

    fun save(maintenance: MaintenanceTicketEntity) : MaintenanceTicketEntity {
        return dynamoDbTemplate.save(maintenance)
    }

    fun findById(id: String) : MaintenanceTicketEntity? {
        return dynamoDbTemplate.load(Key.builder().partitionValue(id).build(), MaintenanceTicketEntity::class.java)
    }

    fun findByMaintenanceScheduleId(maintenanceScheduleId:String) : MaintenanceTicketEntity? {
        val expressionValues = mapOf(":maintenanceScheduleId" to AttributeValue.fromS(maintenanceScheduleId))

        val filterExpression = Expression
            .builder()
            .expression("maintenanceScheduleId = :maintenanceScheduleId")
            .expressionValues(expressionValues)
            .build()

        val pageIterate = dynamoDbTemplate.scan(
            ScanEnhancedRequest.builder().filterExpression(filterExpression).build(),
            MaintenanceTicketEntity::class.java
        )

        return pageIterate.items().firstOrNull()
    }


    fun getAllMaintenanceTickets() : List<MaintenanceTicketEntity> {

        val pageIterate = dynamoDbTemplate.scan(
            ScanEnhancedRequest.builder().build(),
            MaintenanceTicketEntity::class.java
        )

        return pageIterate.flatMap {
            it.items()
        }
    }

    fun getAllByConsultantUser(
        dealershipId:String,
        ticketStatusGroup: TicketStatusGroup?,
        checkInDateTicket: LocalDate?,
        limit: Int,
        sortDirection: String?,
        encodedLastKey: String?
    ): Page<MaintenanceTicketEntity> {
        val queryRequest = DynamoUtils.createQueryDefault(
            partitionValue = dealershipId,
            sortKeys = listOf(ticketStatusGroup?.status, checkInDateTicket?.toString()),
            sortDirection = DynamoUtils.sortDirectionToForward(sortDirection),
            limit = limit,
            encodedLastKey = encodedLastKey
        ).build()

        val pageIterate = dynamoDbTemplate.query(
            queryRequest,
            MaintenanceTicketEntity::class.java,
            selectIndexForDealership(ticketStatusGroup)
        )
        val page = pageIterate.iterator().next()
        val lastKey = page.lastEvaluatedKey()
        return Page(
            items = page.items(),
            lastKey = DynamoUtils.encodeLastKey(lastKey)
        )
    }

    fun getAllByAccountId(
        accountId:String,
        ticketStatusGroup: TicketStatusGroup?,
        checkInDateTicket: LocalDate?,
        limit: Int,
        sortDirection: String?,
        encodedLastKey: String?
    ): Page<MaintenanceTicketEntity> {
        val queryRequest = DynamoUtils.createQueryDefault(
            partitionValue = accountId,
            sortKeys = listOf(ticketStatusGroup?.status, checkInDateTicket?.toString()),
            sortDirection = DynamoUtils.sortDirectionToForward(sortDirection),
            limit = limit,
            encodedLastKey = encodedLastKey
        ).build()

        val pageIterate = dynamoDbTemplate.query(
            queryRequest,
            MaintenanceTicketEntity::class.java,
            selectIndexForAccountId(ticketStatusGroup, accountId)
        )
        val page = pageIterate.iterator().next()
        val lastKey = page.lastEvaluatedKey()
        return Page(
            items = page.items(),
            lastKey = DynamoUtils.encodeLastKey(lastKey)
        )
    }

    private fun selectIndexForAccountId(ticketStatusGroup: TicketStatusGroup?, accountId: String): String {
        return if(ticketStatusGroup == null) {
            if(controlTowerAccountId == accountId)
                MaintenanceTicketEntity.IDX_MAINTENANCE_TICKET_TOWER_ACCOUNT_ID_DATE
            else
                MaintenanceTicketEntity.IDX_MAINTENANCE_TICKET_ACCOUNT_ID_DATE
        } else {
            if(controlTowerAccountId == accountId)
                MaintenanceTicketEntity.IDX_MAINTENANCE_TICKET_TOWER_ACCOUNT_ID
            else
                MaintenanceTicketEntity.IDX_MAINTENANCE_TICKET_ACCOUNT_ID
        }
    }

    private fun selectIndexForDealership(ticketStatusGroup: TicketStatusGroup?): String {
        if(ticketStatusGroup == null) {
            return MaintenanceTicketEntity.IDX_MAINTENANCE_TICKET_DEALERSHIP_ID_DATE
        }
        return MaintenanceTicketEntity.IDX_MAINTENANCE_TICKET_DEALERSHIP_ID
    }

    fun findMaintenanceTicketByChassis(chassis: String): List<MaintenanceTicketEntity> {
        val queryEnhancedRequest = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.keyEqualTo(Key.builder().partitionValue(chassis).build()))
            .build()

        val items = dynamoDbTemplate.query(queryEnhancedRequest, MaintenanceTicketEntity::class.java, IDX_MAINTENANCE_TICKET_CHASSIS)
        return items.items().toList()
    }

    fun getAllByChassisList(chassisList: List<String>): List<MaintenanceTicketEntity> {
        val expressionValues = chassisList.mapIndexed { index, chassis ->
            ":chassis$index" to AttributeValue.fromS(chassis)
        }.toMap()

        val filterExpression = Expression
            .builder()
            .expression(chassisList.indices.joinToString(" OR ") { "chassis = :chassis$it" })
            .expressionValues(expressionValues)
            .build()

        val pageIterate = dynamoDbTemplate.scan(
            ScanEnhancedRequest.builder().filterExpression(filterExpression).build(),
            MaintenanceTicketEntity::class.java
        )

        return pageIterate.items().toList()
    }

    fun getFieldsCampaignSchedulesHistory(id: String, pageSize: Int, cursor: Optional<String>, filterBy: InviterType): Pair<String?, List<MaintenanceTicketEntity>> {
        return getTicketsByCheckupScheduleId(filterBy.getPair(), id, pageSize,"attribute_exists(campaigns)", cursor)
    }

    fun getPreventiveSchedulesHistory(id: String, pageSize: Int, cursor: Optional<String>, filterBy: InviterType): Pair<String?, List<MaintenanceTicketEntity>> {
        return getTicketsByCheckupScheduleId(filterBy.getPair(), id, pageSize,"attribute_exists(checkupId)", cursor)
    }

    fun getAllSchedulesHistory(id: String, pageSize: Int, cursor: Optional<String>, filterBy: InviterType): Pair<String?, List<MaintenanceTicketEntity>> {
        return getTicketsByCheckupScheduleId(filterBy.getPair(), id, pageSize,null, cursor)
    }

    fun getTicketsByCheckupScheduleId(queryPair: Pair<String, String>, id: String, pageSize: Int, expression: String?, cursor: Optional<String>): Pair<String?, List<MaintenanceTicketEntity>> {
        val key = cursor.map { mutableMapOf(queryPair.first to AttributeValue.fromS(id), "id" to AttributeValue.fromS(it)) }.orElse(mutableMapOf())

        val queryConditional = QueryConditional
            .keyEqualTo(Key.builder().partitionValue(id).build())

        val queryBuilder  = QueryEnhancedRequest.builder()
        queryBuilder.queryConditional(queryConditional)
        queryBuilder.limit(pageSize)
        expression?.let {  queryBuilder.filterExpression(Expression.builder().expression(expression).build())}

        val queryRequest = if (key.isNotEmpty()) {
            queryBuilder.exclusiveStartKey(key).build()
        } else {
            queryBuilder.build()
        }

        val queryResponse = dynamoDbTemplate.query(queryRequest, MaintenanceTicketEntity::class.java, queryPair.second)

        val items = queryResponse.iterator().next()

        return Pair(items.lastEvaluatedKey()?.get("id")?.s(), items.items())
    }

    fun getTotalVehicleInMaintenanceByChassisAndStateNotLike(assetId: String, step: String): Int {
        return getTotalVehiclesByStepAndChassis(assetId, "<>", step)
    }

    fun getTotalVehicleMaintenanceByChassisAndState(assetId: String, step: String): Int {
        return getTotalVehiclesByStepAndChassis(assetId, "=", step)
    }

    private fun getTotalVehiclesByStepAndChassis(assetId: String, logicalOperator: String, step: String): Int {
        val filterExpression = Expression
            .builder()
            .expression("#status $logicalOperator :currentStep")
            .expressionValues(mapOf(":currentStep" to AttributeValue.fromS(step)))
            .expressionNames(mapOf("#status" to "status"))
            .build()


        val queryEnhancedRequest = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.keyEqualTo(Key.builder().partitionValue(assetId).build()))
            .filterExpression(filterExpression)
            .limit(1)
            .build()

        val items = dynamoDbTemplate.query(queryEnhancedRequest, MaintenanceTicketEntity::class.java, IDX_MAINTENANCE_TICKET_CHASSIS)
        return items.items().count()
    }

    fun getMaintenanceTicketByCheckupScheduleId(checkupScheduleId: String): MaintenanceTicketEntity? {

        val queryConditional = QueryConditional.keyEqualTo(Key.builder().partitionValue(checkupScheduleId).build())

        val queryRequest  = QueryEnhancedRequest.builder().queryConditional(queryConditional).build()

        val pageIterate =  dynamoDbTemplate.query(queryRequest, MaintenanceTicketEntity::class.java, IDX_MAINTENANCE_TICKET_CHECKUP_SCHEDULE)

        return pageIterate.items().firstOrNull()
    }

    private fun InviterType.getPair() : Pair<String, String> {
        return if (this == InviterType.MANAGER) {
            Pair("sourceAccountId", IDX_MAINTENANCE_TICKET_SOURCE_ACCOUNT_ID)
        } else {
            Pair("destinationUserId", IDX_MAINTENANCE_TICKET_DESTINATION_USER_ID)
        }
    }
}