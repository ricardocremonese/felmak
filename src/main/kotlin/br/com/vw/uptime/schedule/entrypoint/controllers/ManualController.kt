package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.entrypoint.requests.ManualRequest
import br.com.vw.uptime.schedule.infrastructure.gateway.response.ManualDigitalResponse
import br.com.vw.uptime.schedule.infrastructure.services.riogateway.ManualService
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/v1/manual")
class ManualController(val manualService: ManualService) {

    @PostMapping
    fun getManuals(@RequestParam("type") type: String, @RequestBody manualRequest: ManualRequest) :
            List<ManualDigitalResponse>? {
        return manualService.getManual(type, manualRequest)
    }

    @GetMapping
    fun getManuals(@RequestParam("chassi") chassis: String) : ManualDigitalResponse? {
        return manualService.getManual(chassis)
    }
}