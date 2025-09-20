package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.infrastructure.services.occurence.ServiceBayScheduleRequest
import br.com.vw.uptime.schedule.infrastructure.services.occurence.ServiceBayScheduleResponse
import br.com.vw.uptime.schedule.infrastructure.services.occurence.ServiceBayScheduleResponseList
import br.com.vw.uptime.schedule.infrastructure.services.occurence.ServiceBayScheduleService
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime


@RestController
@RequestMapping("/v1/service-bay-schedule")
class ServiceBayScheduleController(
    private val serviceBayScheduleService: ServiceBayScheduleService,
    private val usrSvc:UserAuthServiceImpl
) {

    @PostMapping
    fun add(@RequestBody @Validated request:ServiceBayScheduleRequest) : ServiceBayScheduleResponse {
        return serviceBayScheduleService.add(request, usrSvc.usr())
    }

    @DeleteMapping("/{serviceBayScheduleId}")
    fun cancel(
        @PathVariable("serviceBayScheduleId") serviceBayScheduleId:String
    ): ServiceBayScheduleResponse {
        return serviceBayScheduleService.cancel(serviceBayScheduleId, usrSvc.usr())
    }

    @GetMapping
    fun list(
        @RequestParam("startDate", required = true) startDate:LocalDateTime,
        @RequestParam("endDate", required = true) endDate:LocalDateTime,
        @RequestParam("serviceBayIds", required = true, defaultValue = "") serviceBayIds:List<String>,
    ): List<ServiceBayScheduleResponseList> {
        return serviceBayScheduleService.list(
            startDate = startDate,
            endDate = endDate,
            serviceBayIds = serviceBayIds,
            usr = usrSvc.usr(),
        )
    }

    @GetMapping("/occurrence/{occurrenceId}")
    fun getByOccurrenceId(
        @PathVariable("occurrenceId") occurrenceId:String
    ): ServiceBayScheduleResponse {
        return serviceBayScheduleService.getByOccurrenceId(occurrenceId, usrSvc.usr())
    }
}