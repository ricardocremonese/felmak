package br.com.vw.uptime.schedule.core.models.alerts

import br.com.vw.uptime.schedule.infrastructure.repositories.alerts.TotalData

class TotalAlert(
    private val totalData: TotalData
) {
    fun getTotal(): Long {
        return totalData.total
    }
    fun getTotalAttentionAlert() : Long {
        return totalData.totalCriticalAlert
    }
    fun getTotalCriticalAlert() : Long {
        return totalData.totalAttentionAlert
    }
}