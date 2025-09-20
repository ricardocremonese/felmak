package br.com.vw.uptime.schedule.infrastructure.entities.maintenance

import br.com.vw.uptime.schedule.core.enums.maintenance.StepType
import br.com.vw.uptime.schedule.core.models.maintenance.ticket.TicketStatusGroup
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.FieldCampaignTicketEntity.Companion.IDX_MAINTENANCE_TICKET_CHASSIS
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.FieldCampaignTicketEntity.Companion.IDX_MAINTENANCE_TICKET_CHECKUP_SCHEDULE
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime


@DynamoDbBean
class MaintenanceTicketEntity {

    companion object {
        const val IDX_MAINTENANCE_TICKET_ACCOUNT_ID = "maintenance_ticket_account_id"
        const val IDX_MAINTENANCE_TICKET_DEALERSHIP_ID = "maintenance_ticket_dealership_id"
        const val IDX_MAINTENANCE_TICKET_TOWER_ACCOUNT_ID = "maintenance_ticket_tower_account_id"

        const val IDX_MAINTENANCE_TICKET_ACCOUNT_ID_DATE = "maintenance_ticket_account_id_date"
        const val IDX_MAINTENANCE_TICKET_DEALERSHIP_ID_DATE = "maintenance_ticket_dealership_id_date"
        const val IDX_MAINTENANCE_TICKET_TOWER_ACCOUNT_ID_DATE = "maintenance_ticket_tower_account_id_date"
    }

    @get:DynamoDbPartitionKey
    lateinit var id: String

    @get:DynamoDbAttribute("scheduleDate")
    lateinit var scheduleDate: LocalDateTime

    @get:DynamoDbAttribute("maintenanceScheduleId")
    @get:DynamoDbSecondaryPartitionKey(indexNames = [IDX_MAINTENANCE_TICKET_CHECKUP_SCHEDULE])
    lateinit var maintenanceScheduleId: String

    @get:DynamoDbAttribute("checkupId")
    var checkup: CheckupTicketChildEntity? = null

    @get:DynamoDbAttribute("status")
    lateinit var status: String

    @get:DynamoDbFlatten
    lateinit var accounts:AccountsTicketEntity

    @get:DynamoDbAttribute("vehicle")
    lateinit var vehicle: VehicleTicketEntity

    var campaigns:List<FieldCampaignTicketEntity> = listOf()

    @get:DynamoDbAttribute("ticket")
    lateinit var ticket:TicketPhaseChild

    @get:DynamoDbAttribute("inspection")
    var inspection:InspectionEntity? = null

    @get:DynamoDbAttribute(value = "rates")
    var rates: Map<String, RateEntity> = mutableMapOf()

    @get:DynamoDbIgnoreNulls
    @get:DynamoDbAttribute(value = "screening")
    var screening: ScreeningEntity? = null

    @get:DynamoDbIgnoreNulls
    @get:DynamoDbAttribute(value = "repair")
    var repair: RepairEntity? = null

    @get:DynamoDbIgnoreNulls
    @get:DynamoDbAttribute(value = "release")
    var release: ReleaseEntity? = null

    @get:DynamoDbAttribute("chassis")
    @get:DynamoDbSecondaryPartitionKey(indexNames = [IDX_MAINTENANCE_TICKET_CHASSIS])
    var chassis: String? = null

    @get:DynamoDbSecondaryPartitionKey(
        indexNames = [
            IDX_MAINTENANCE_TICKET_ACCOUNT_ID,
            IDX_MAINTENANCE_TICKET_ACCOUNT_ID_DATE
        ]
    )
    var accountId:String? = null

    @get:DynamoDbSecondaryPartitionKey(
        indexNames = [
            IDX_MAINTENANCE_TICKET_DEALERSHIP_ID,
            IDX_MAINTENANCE_TICKET_DEALERSHIP_ID_DATE
        ]
    )
    var dealershipId:String? = null

    @get:DynamoDbSecondaryPartitionKey(
        indexNames = [
            IDX_MAINTENANCE_TICKET_TOWER_ACCOUNT_ID,
            IDX_MAINTENANCE_TICKET_TOWER_ACCOUNT_ID_DATE
        ]
    )
    var towerAccountId:String? = null

    @get:DynamoDbSecondarySortKey(indexNames = [
        IDX_MAINTENANCE_TICKET_ACCOUNT_ID_DATE,
        IDX_MAINTENANCE_TICKET_DEALERSHIP_ID_DATE,
        IDX_MAINTENANCE_TICKET_TOWER_ACCOUNT_ID_DATE
    ])
    var startDate:String? = null

    @get:DynamoDbAttribute("statusGrp_startDt")
    @get:DynamoDbSecondarySortKey(indexNames = [
        IDX_MAINTENANCE_TICKET_ACCOUNT_ID,
        IDX_MAINTENANCE_TICKET_DEALERSHIP_ID,
        IDX_MAINTENANCE_TICKET_TOWER_ACCOUNT_ID
    ])
    var statusGroupAndStartDate:String? = null

    fun updateStatusGroupAndStartDate() {
        val startLocalDate = LocalDateTime.of(
            ticket.checkInDate,
            ticket.checkInHour
        )
        this.startDate = startLocalDate.toString()
        statusGroupAndStartDate = getCurrentStatusGroup() + "#" + startLocalDate
    }

    private fun getCurrentStatusGroup() : String {
        if(this.status == StepType.FINISHED.name) {
            return TicketStatusGroup.FINISHED.status
        }
        return TicketStatusGroup.PENDING.status
    }

    @get:DynamoDbAttribute("hasReview")
    var hasReview: Boolean = false
}

@DynamoDbBean
class AccountsTicketEntity {
    lateinit var sourceAccountId: String

    @get:DynamoDbAttribute("sourceUserId")
    lateinit var sourceUserId: String

    @get:DynamoDbAttribute("destinationAccountId")
    lateinit var destinationAccountId: String

    @get:DynamoDbAttribute("destinationUserId")
    lateinit var destinationUserId: String
}

@DynamoDbBean
class VehicleTicketEntity {
    @get:DynamoDbAttribute("identification")
    var identification: String? = null

    @get:DynamoDbAttribute("model")
    var model: String? = null

    @get:DynamoDbAttribute("name")
    var name: String? = null
}

@DynamoDbBean
class FieldCampaignTicketEntity {

    @get:DynamoDbAttribute("number")
    lateinit var number:String

    @get:DynamoDbAttribute("name")
    lateinit var name: String

    @get:DynamoDbAttribute("validityFrom")
    lateinit var validityFrom: LocalDate

    @get:DynamoDbAttribute("validityUntil")
    lateinit var validityUntil: LocalDate

    @get:DynamoDbAttribute("classification")
    lateinit var classification:String

    @get:DynamoDbAttribute("averagePrice")
    lateinit var averagePrice: BigDecimal

    @get:DynamoDbAttribute("campaignYear")
    lateinit var campaignYear:String

    @get:DynamoDbAttribute("campaignStatus")
    lateinit var campaignStatus:String

    @get:DynamoDbAttribute("dn")
    lateinit var dn: String

    @get:DynamoDbAttribute("vehicle")
    var vehicle: String? = null

    @get:DynamoDbAttribute("repairDate")
    var repairDate: LocalDate? = null

    @get:DynamoDbAttribute("repairStatus")
    lateinit var repairStatus:String

    companion object {
        const val IDX_MAINTENANCE_TICKET_DESTINATION_USER_ID = "maintenance_ticket_destination_user_id"
        const val IDX_MAINTENANCE_TICKET_SOURCE_ACCOUNT_ID = "maintenance_ticket_source_account_id"
        const val IDX_MAINTENANCE_TICKET_CHASSIS = "maintenance_ticket_chassis"
        const val IDX_MAINTENANCE_TICKET_CHECKUP_SCHEDULE = "maintenance_ticket_checkup_schedule_id"
    }
}

@DynamoDbBean
class CheckupTicketChildEntity {
    var value:Long = 0
    var maintenanceGroupId:String? = null
}

interface TicketStep {
    fun checkInDate():LocalDateTime
    fun checkOutDate():LocalDateTime?
}