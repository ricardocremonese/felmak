package br.com.vw.uptime.schedule.entrypoint.requests

import br.com.vw.uptime.schedule.core.enums.schedule.InviterType
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

class CheckupScheduleProducerRequest {

    @Valid
    @NotNull
    var schedule: ScheduleRequest = ScheduleRequest()
    @Valid
    @NotNull
    var vehicleSchedule = VehicleScheduleTowerRequest()
    @NotNull
    lateinit var createdBy:InviterType
    @NotBlank
    var dealershipId = ""
    var checkupId:String? = null
    var fieldCampaignNumbers:List<String> = arrayListOf()
    var consultantId:String? = null
    var towerUserId:String? = null
    @Valid
    var otherServices: List<VehicleServiceRequest> = arrayListOf()
}