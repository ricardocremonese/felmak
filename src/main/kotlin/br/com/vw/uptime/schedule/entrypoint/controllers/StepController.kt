package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.entrypoint.requests.StepUpdateRequest
import br.com.vw.uptime.schedule.entrypoint.responses.occurrence.StepResponse
import br.com.vw.uptime.schedule.infrastructure.services.occurence.StepServiceImpl
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/occurrence/step")
class StepController(
    private val stepServiceImpl: StepServiceImpl
) {

    @GetMapping
    fun getAll(): List<StepResponse> {
        return stepServiceImpl.getAll()
    }

    @PutMapping("/{id}")
    fun changeHoursElapsed(
        @PathVariable("id") id:String,
        @RequestBody stepRequest:StepUpdateRequest
    ): StepResponse {
        return stepServiceImpl.changeHoursElapsed(
            id,
            stepRequest
        )
    }

}