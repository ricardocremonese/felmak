package br.com.vw.uptime.schedule.entrypoint.requests.assistance

import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

class AssignDispatchRequest {

    @NotBlank
    lateinit var dealershipId:String

    @NotNull
    @Valid
    lateinit var vehicleLocationRequest:VehicleLocationRequest
}