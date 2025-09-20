package br.com.vw.uptime.schedule.infrastructure.entities.checkup


import br.com.vw.uptime.schedule.core.enums.checkups.CheckupTypeScheduleEnum
import br.com.vw.uptime.schedule.core.enums.checkups.CheckupScheduleState
import br.com.vw.uptime.schedule.core.enums.schedule.ScheduleStateEnum
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.CheckupScheduleRepository.Companion.IDX_CHECKUP_SCHEDULE_ACCOUNT_ID
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.CheckupScheduleRepository.Companion.IDX_CHECKUP_SCHEDULE_ASSET_ID
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.CheckupScheduleRepository.Companion.IDX_CHECKUP_SCHEDULE_CHASSIS
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.CheckupScheduleRepository.Companion.IDX_CHECKUP_SCHEDULE_DEALERSHIP_ID
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.CheckupScheduleRepository.Companion.IDX_CHECKUP_SCHEDULE_TOWER_ACCOUNT_ID
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.CheckupScheduleRepository.Companion.IDX_CHECKUP_SCHEDULE_TOWER_ASSET_ID
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.*
import java.util.*

@DynamoDbBean
class CheckupScheduleEntity {

    @get:DynamoDbPartitionKey
    lateinit var id: UUID

    @get:DynamoDbAttribute(value = "protocol")
    var protocol: String? = null

    var scheduleNumber: String? = null

    @get:DynamoDbIgnoreNulls
    @get:DynamoDbAttribute(value = "schedule")
    var schedule: ScheduleInCheckupEntity = ScheduleInCheckupEntity()
        set(value) {
            field = value
            updateStateAndScheduleDate()
        }

    fun updateStateAndScheduleDate() {
        stateAndScheduledDate = defState(schedule.state) + "#" + schedule.scheduledDate
    }

    private fun defState(state: String): String {
        if(state == ScheduleStateEnum.REJECTED.state()) {
            return CheckupScheduleState.CANCELED.state
        }
        return CheckupScheduleState.PENDING.state
    }

    @get:DynamoDbIgnoreNulls
    @get:DynamoDbAttribute(value = "vehicleSchedule")
    lateinit var vehicleSchedule: VehicleScheduleEntity

    @get:DynamoDbAttribute("checkup")
    var checkup:CheckupChildEntity? = null

    @get:DynamoDbIgnoreNulls
    @get:DynamoDbAttribute("campaign")
    var campaigns:List<CampaignScheduleChild> = arrayListOf()

    @get:DynamoDbIgnoreNulls
    @get:DynamoDbAttribute("consultant")
    lateinit var consultant:ConsultantScheduleChild

    @get:DynamoDbAttribute("towerUserId")
    var towerUserId: String? = ""

    @get:DynamoDbAttribute("createdBy")
    var createdBy: String?= ""

    @get:DynamoDbAttribute("createdByUserProfileId")
    var createdByUserProfileId: String?= ""
    
    @get:DynamoDbAttribute("scheduledBy")
    var scheduledBy: String?= ""

    @get:DynamoDbAttribute("waitFor")
    var waitFor: String? = ""

    @get:DynamoDbSecondaryPartitionKey(indexNames = [IDX_CHECKUP_SCHEDULE_ACCOUNT_ID])
    var accountId:String? = null

    @get:DynamoDbSecondaryPartitionKey(indexNames = [IDX_CHECKUP_SCHEDULE_ASSET_ID])
    var assetId: String? = null

    @get:DynamoDbSecondaryPartitionKey(indexNames = [IDX_CHECKUP_SCHEDULE_TOWER_ACCOUNT_ID])
    @get:DynamoDbAttribute("tAccountId")
    var towerAccountId:String? = null

    @get:DynamoDbSecondaryPartitionKey(indexNames = [IDX_CHECKUP_SCHEDULE_TOWER_ASSET_ID])
    @get:DynamoDbAttribute("tAssetId")
    var towerAssetId:String? = null

    @get:DynamoDbAttribute("chassis")
    @get:DynamoDbSecondaryPartitionKey(indexNames = [IDX_CHECKUP_SCHEDULE_CHASSIS])
    var chassis: String? = null

    @get:DynamoDbAttribute("wasViewed")
    var wasViewed: Boolean? = false

    @get:DynamoDbSecondarySortKey(
        indexNames = [
            IDX_CHECKUP_SCHEDULE_DEALERSHIP_ID,
            IDX_CHECKUP_SCHEDULE_ACCOUNT_ID,
            IDX_CHECKUP_SCHEDULE_TOWER_ACCOUNT_ID
        ]
    )
    @get:DynamoDbAttribute("active_schDate")
    var stateAndScheduledDate: String? = null

    @get:DynamoDbSecondaryPartitionKey(indexNames = [IDX_CHECKUP_SCHEDULE_DEALERSHIP_ID])
    var dealershipId:String? = null
}

@DynamoDbBean
class CheckupChildEntity {
    var value:Long = 0
    var maintenanceGroupId:String? = null
    var type:CheckupTypeScheduleEnum? = null
    var hasCampaigns:Boolean? = null
}