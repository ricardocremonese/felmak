package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.infrastructure.services.occurence.ServiceBayAddRequest
import br.com.vw.uptime.schedule.infrastructure.services.occurence.ServiceBayResponse
import br.com.vw.uptime.schedule.infrastructure.services.occurence.ServiceBayService
import br.com.vw.uptime.schedule.infrastructure.services.occurence.ServiceBayUpdateRequest
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("/v1/service-bay")
class ServiceBayController(
    val serviceBayService: ServiceBayService,
    val usrSvc:UserAuthServiceImpl
) {

    @PostMapping
    fun add(
        @RequestBody @Validated serviceBayAddRequest: ServiceBayAddRequest
    ): ServiceBayResponse {
        return serviceBayService.add(serviceBayAddRequest, usrSvc.usr())
    }

    @PutMapping("/{id}")
    fun update(
        @PathVariable("id") serviceBayId:String,
        @RequestBody @Validated serviceBayUpdateRequest: ServiceBayUpdateRequest
    ): ServiceBayResponse {
        return serviceBayService.update(serviceBayId, serviceBayUpdateRequest)
    }

    @GetMapping("")
    fun list(): List<ServiceBayResponse> {
        return serviceBayService.list(usrSvc.usr())
    }

    @DeleteMapping("/{id}")
    fun delete(
        @PathVariable("id") serviceBayId:String
    ): ServiceBayResponse {
        return serviceBayService.delete(serviceBayId)
    }

}