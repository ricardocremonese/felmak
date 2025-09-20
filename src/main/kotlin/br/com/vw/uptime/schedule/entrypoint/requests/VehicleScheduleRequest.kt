package br.com.vw.uptime.schedule.entrypoint.requests

import br.com.vw.uptime.schedule.core.models.maintenance.*
import jakarta.validation.Valid
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull

class VehicleScheduleRequest {
    @Valid
    @NotNull
    var vehicle: Vehicle = Vehicle()
    @Valid
    var driver: Driver? = null
    @NotNull
    var generalObservations:String = ""
    @NotNull
    var comments:String = ""
    @Valid
    var otherServices: List<VehicleServiceRequest> = arrayListOf()
}