package br.com.vw.uptime.schedule.entrypoint.requests

import br.com.vw.uptime.schedule.core.enums.schedule.InviterType
import br.com.vw.uptime.schedule.core.enums.checkups.CheckupTypeScheduleEnum
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

class CheckupScheduleRequest {

    @Valid
    @NotNull
    var schedule: ScheduleRequest = ScheduleRequest()
    @Valid
    @NotNull
    var vehicleSchedule: VehicleScheduleRequest = VehicleScheduleRequest()
    @NotNull
    lateinit var createdBy: InviterType
    var checkup:CheckupRequest? = null
    @JsonProperty(defaultValue = "")
    var fieldCampaignNumbers:List<String> = arrayListOf()
    @NotBlank
    var consultantId:String? = null
    var towerUserId:String? = null
    var scheduledBy:String? = null
    var createdByUserProfileId:String? = null
}

class CheckupRequest {
    var value:Long = 0
    @NotNull
    var maintenanceGroupId:String? = null
    var type:CheckupTypeScheduleEnum? = null
    var hasCampaigns:Boolean? = null
}