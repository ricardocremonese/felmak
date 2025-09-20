package br.com.vw.uptime.schedule.entrypoint.requests

import jakarta.validation.constraints.NotNull

class StepUpdateRequest {

    @NotNull
    var hoursElapsed:Int? = 0
}