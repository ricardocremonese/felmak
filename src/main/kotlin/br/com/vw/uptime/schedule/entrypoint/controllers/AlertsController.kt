package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.core.models.alerts.VehicleAlert
import br.com.vw.uptime.schedule.infrastructure.repositories.alerts.AlertRequest
import br.com.vw.uptime.schedule.infrastructure.services.alert.AlertServiceImpl
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("/v1/alerts")
class AlertsController(
    val alertServiceImpl: AlertServiceImpl
) {

    @PostMapping
    fun getAlerts(@RequestBody alertRequest: AlertRequest) : VehicleAlert {
        return alertServiceImpl.getAlerts(alertRequest)
    }

}