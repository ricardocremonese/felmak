package br.com.vw.uptime.schedule.entrypoint.requests

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.Valid
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull

class CheckupScheduleTowerRequest {

    @Valid
    @NotNull
    var schedule: ScheduleRequest = ScheduleRequest()
    @Valid
    @NotNull
    var vehicleSchedule = VehicleScheduleTowerRequest()
    var checkupId:String? = null
    @JsonProperty(defaultValue = "")
    @NotEmpty
    var fieldCampaignNumbers:List<String> = arrayListOf()
    var consultantId:String? = null
    @Valid
    var otherServices: List<VehicleServiceRequest> = arrayListOf()
}