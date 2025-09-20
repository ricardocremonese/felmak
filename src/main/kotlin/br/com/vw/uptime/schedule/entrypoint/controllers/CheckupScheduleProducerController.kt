package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.entrypoint.requests.CheckupScheduleProducerRequest

import br.com.vw.uptime.schedule.infrastructure.services.checkup.CheckupScheduleSenderService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("/v1/schedule/producer")
class CheckupScheduleProducerController(
    val checkupScheduleSenderService: CheckupScheduleSenderService
) {

    @PostMapping
    fun createSchedule(@RequestBody @Valid checkupScheduleProducerRequest: CheckupScheduleProducerRequest) {
        checkupScheduleSenderService.send(checkupScheduleProducerRequest)
    }

}