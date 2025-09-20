package br.com.vw.uptime.schedule.entrypoint.requests

import jakarta.validation.constraints.NotBlank

class VehicleScheduleTowerRequest {
    @NotBlank
    var chassis:String = ""

    var cnh: String? = null

    var odometer: Long? = null
    var hourMeter: Long? = null
}