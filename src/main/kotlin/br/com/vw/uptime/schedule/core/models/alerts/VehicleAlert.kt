package br.com.vw.uptime.schedule.core.models.alerts

import br.com.vw.uptime.schedule.infrastructure.repositories.alerts.AlertData

class VehicleAlert(
    private val alertData: AlertData
) {
    fun getData() : List<Data> {
        return alertData.data.map {
            Data(it)
        }
    }

    fun getTotal() : TotalAlert {
        return TotalAlert(alertData.total)
    }
}