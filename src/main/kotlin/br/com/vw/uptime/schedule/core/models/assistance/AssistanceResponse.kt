package br.com.vw.uptime.schedule.core.models.assistance

import java.time.LocalDateTime

class AssistanceResponse {
    lateinit var id:String
    var assetId:String? = null
    var occurType:String? = null
    var chassis:String? = null
    var vehicle: VehicleAssistanceAddResponse? = null
    var driver: DriverAddResponse? = null
    var occurrence: OccurrenceAddResponse? = null
    var dispatch:AssistanceDispatchResponse? = null
    var finishedAt:LocalDateTime? = null
    var state:String? = null
    var priority:Int? = null
}

class VehicleAssistanceAddResponse {
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

class OccurrenceAddResponse {
    var hasBound:Boolean? = null
    var origin:String? = null
    var subject:String? = null
    var mainOccurrence:String? = null
    var customerRequest:String? = null
    var dtcs:List<DTCAddResponse> = arrayListOf()
    var diagnosis:String? = null
    var partsCode:String? = null
    var givenSolution:String? = null
    var load:String = ""
    var loadWeight:Double? = null
    var criticalLoad:Boolean? = null
}

class DriverAddResponse {
    var name: String = ""
    var cnh: String = ""
    var email: String = ""
    var phone: String = ""
}

class DTCAddResponse {
    var module:String? = null
    var dtcName:String? = null
    var fmi:String? = null
}

class DealershipAssistanceResponse {
    lateinit var dealershipId: String
    var fantasyName: String? = null
    var state: String? = null
    var city: String? = null
}

class VehicleLocationResponse {
    var street:String? = null
    var neighbourhood:String? = null
    var city:String? = null
    var state:String? = null
    var latitude:Double? = null
    var longitude:Double? = null
}

class DispatchStepResponse {
    lateinit var id:String
    lateinit var name:String
    var isDefault: Boolean = false
    var done: Boolean = false
    var updateAt: LocalDateTime? = null
    var assignedTo: String? = null
}

class AssistanceDispatchResponse {
    var dealership:DealershipAssistanceResponse? = null
    var vehicleLocation:VehicleLocationResponse? = null
    var steps: List<DispatchStepResponse>? = emptyList()
    var refund:AssistanceRefundResponse? = null
}