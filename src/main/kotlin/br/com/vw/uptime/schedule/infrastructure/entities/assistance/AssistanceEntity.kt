package br.com.vw.uptime.schedule.infrastructure.entities.assistance

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.*
import java.time.LocalDateTime


@DynamoDbBean
class AssistanceEntity {

    companion object {
        const val IDX_ASSISTANCE_CHASSIS = "assistance_chassis"
        const val IDX_ASSISTANCE_STATE = "assistance_state"
        const val IDX_ASSISTANCE_TOWER_ASSET_ID = "assistance_t_asset_id"
        const val IDX_ASSISTANCE_OCCUR_TYPE_CREATED_DATE = "assistance_occur_type_created_date"
    }

    @get:DynamoDbPartitionKey
    lateinit var id:String
    @get:DynamoDbSecondaryPartitionKey(indexNames = [IDX_ASSISTANCE_CHASSIS])
    var chassis:String? = null

    @get:DynamoDbSecondaryPartitionKey(indexNames = [IDX_ASSISTANCE_OCCUR_TYPE_CREATED_DATE])
    lateinit var occurType:String
    /**
     * Customer assetId
     */
    var assetId:String? = null
    /**
     * Customer accountId
     */
    var accountId:String? = null
    /**
     * Control tower assetId
     */
    @get:DynamoDbSecondaryPartitionKey(indexNames = [IDX_ASSISTANCE_TOWER_ASSET_ID])
    @get:DynamoDbAttribute("tAssetId")
    var towerAssetId:String? = null
    /**
     * Control tower accountId
     */
    @get:DynamoDbAttribute("tAccountId")
    var towerAccountId:String? = null
    @get:DynamoDbIgnoreNulls
    var vehicle:VehicleAssistanceEntity? = null
    var driver:DriverEntity? = null
    var occurrence:OccurrenceEntity? = null
    @get:DynamoDbIgnoreNulls
    var dispatch:AssistanceDispatchEntity? = null
    var canceledDispatches:List<AssistanceDispatchEntity> = arrayListOf()
    var history:List<AssistanceHistoryEntity> = listOf()
    var createdBy:UserEntity? = null
    @get:DynamoDbSecondaryPartitionKey(indexNames = [IDX_ASSISTANCE_STATE])
    var state:String? = null
        set(value) {
            field = value
            updateStateAndCreatedDate()
        }
    var finishedAt:LocalDateTime? = null
    @get:DynamoDbSecondarySortKey(indexNames = [IDX_ASSISTANCE_STATE])
    lateinit var createdAt:LocalDateTime
    @get:DynamoDbSecondarySortKey(indexNames = [IDX_ASSISTANCE_OCCUR_TYPE_CREATED_DATE])
    @get:DynamoDbAttribute("stateAndCreatedDate")
    lateinit var stateAndCreatedDate:String
    var priority:Int? = null
    var scheduledBy:String? = null

    private fun updateStateAndCreatedDate() {
        stateAndCreatedDate = "$state#$createdAt"
    }
}

@DynamoDbBean
class VehicleAssistanceEntity {
    var customer:String? = null
    var vehicleType:String? = null
    var contactType:String? = null
    var requestedCountry:String? = null
    var vehiclePlate:String? = null
    var vehicleModel:String? = null
    var vehicleYear:Int? = null
    var odometer:Double? = null
    var hourMeter:Double? = null
}

@DynamoDbBean
class OccurrenceEntity {
    var hasBound:Boolean? = null
    var origin:String? = null
    var subject:String? = null
    var mainOccurrence:String? = null
    var customerRequest:String? = null
    var dtcs:List<DTCEntity> = arrayListOf()
    var diagnosis:String? = null
    var partsCode:String? = null
    var givenSolution:String? = null
    var load:String = ""
    var loadWeight:Double? = null
    var criticalLoad:Boolean? = null
}

@DynamoDbBean
class DriverEntity {
    var name: String = ""
    var cnh: String = ""
    var email: String = ""
    var phone: String = ""
}

@DynamoDbBean
class DTCEntity {
    var module:String? = null
    var dtcName:String? = null
    var fmi:String? = null
}

@DynamoDbBean
class DealershipAssistanceEntity {
    lateinit var dealershipId: String
    var fantasyName: String? = null
    var state: String? = null
    var city: String? = null
}

@DynamoDbBean
class VehicleLocationEntity {
    var street:String? = null
    var neighbourhood:String? = null
    var city:String? = null
    var state:String? = null
    var latitude:Double? = null
    var longitude:Double? = null
}

@DynamoDbBean
class AssistanceDispatchEntity {
    var dealership:DealershipAssistanceEntity? = null
    var vehicleLocation:VehicleLocationEntity? = null
    @get:DynamoDbIgnoreNulls
    var steps: List<DispatchStepEntity>? = emptyList()
    var createdAt:LocalDateTime? = null
    var canceledAt:LocalDateTime? = null
    var reason:String? = null
    var justification:String? = null
    lateinit var refund:AssistanceRefundEntity
}

@DynamoDbBean
class UserEntity {
    lateinit var accountId:String
    lateinit var userId:String
}

@DynamoDbBean
class AssistanceHistoryEntity {
    lateinit var state:String
    lateinit var date:LocalDateTime
    lateinit var userHistory: UserHistoryEntity
}

@DynamoDbBean
class UserHistoryEntity {
    var accountId:String? = null
    var userId:String? = null
    var isTower:Boolean =  false
    var dealershipId:String? = null
    var dealershipName:String? = null
}

@DynamoDbBean
class AssistanceRefundEntity {
    lateinit var protocolNumber:String
    lateinit var customer: String
    lateinit var paidBy:String
    var releasePayment:Boolean = false
}

@DynamoDbBean
class DispatchStepEntity {
    lateinit var id:String
    lateinit var name:String
    var done: Boolean = false
    var isDefault: Boolean = false
    var updateAt: LocalDateTime? = null
    var assignedTo: String? = null
}