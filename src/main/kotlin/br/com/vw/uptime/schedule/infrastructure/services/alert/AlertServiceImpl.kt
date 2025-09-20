package br.com.vw.uptime.schedule.infrastructure.services.alert

import br.com.vw.uptime.schedule.core.models.alerts.VehicleAlert
import br.com.vw.uptime.schedule.infrastructure.repositories.alerts.AlertRequest
import br.com.vw.uptime.schedule.infrastructure.repositories.alerts.AlertsRepository
import org.springframework.stereotype.Service

@Service
class AlertServiceImpl(
    val alertsRepository: AlertsRepository
) {
    fun getAlerts(alertRequest: AlertRequest) : VehicleAlert {
        val alertData = alertsRepository.getAlerts(alertRequest)
        return VehicleAlert(alertData)
    }
}