package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.core.models.maintenance.VehicleInfoRequest
import br.com.vw.uptime.schedule.core.models.maintenance.VehicleInfoTable
import br.com.vw.uptime.schedule.infrastructure.services.checkup.EngineInfo
import br.com.vw.uptime.schedule.infrastructure.services.checkup.VehicleInfoServiceImpl
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("v1/maintenance")
class VehicleInfoController(
    val vehicleInfoServiceImpl: VehicleInfoServiceImpl
) {

    @PostMapping
    fun getAll(@RequestBody request: VehicleInfoRequest) : VehicleInfoTable {
        return vehicleInfoServiceImpl.allVehiclesV1(request)
    }

    @GetMapping("/engine/{chassis}")
    fun getEngineByChassis(@PathVariable(name = "chassis") chassis: String) : EngineInfo = vehicleInfoServiceImpl.getEngineByChassis(chassis)
}