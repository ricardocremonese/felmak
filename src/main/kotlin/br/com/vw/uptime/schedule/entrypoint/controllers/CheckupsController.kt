package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.infrastructure.services.maintenance.CheckupResponse
import br.com.vw.uptime.schedule.infrastructure.services.maintenance.CheckupsService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/checkups")
class CheckupsController(
    val checkupsService: CheckupsService
) {

    @GetMapping("/by-model-group")
    fun checkupByModelAndGroup(
        @RequestParam(name = "chassis") chassis: String,
        @RequestParam(name = "maintenanceGroup") maintenanceGroup: String,
        @RequestParam(name = "odometer") odometer: Double,
        @RequestParam(name = "hourMeter", required = false) hourMeter: Double?,
        @RequestParam(name = "model", required = false) model: String?
    ) : CheckupResponse {
        return checkupsService.getCheckupInfo(chassis, maintenanceGroup, odometer, hourMeter, model)
    }
}