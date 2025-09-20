package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.core.models.drivers.Driver
import br.com.vw.uptime.schedule.infrastructure.services.driver.DriverServiceImpl
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("/v1/drivers")
class DriverController(
    val driverServiceImpl: DriverServiceImpl
) {

    @GetMapping("")
    fun drivers(@RequestParam(name = "q", defaultValue = "") search:String) : List<Driver> {
        return driverServiceImpl.drivers(search)
    }

}