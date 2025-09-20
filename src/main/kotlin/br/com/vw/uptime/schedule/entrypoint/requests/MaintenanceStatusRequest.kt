package br.com.vw.uptime.schedule.entrypoint.requests

import jakarta.validation.constraints.NotBlank

class MaintenanceStatusRequest {
    @NotBlank
    var checkupScheduleId:String = ""

    @NotBlank
    var statusId:String =  ""
}