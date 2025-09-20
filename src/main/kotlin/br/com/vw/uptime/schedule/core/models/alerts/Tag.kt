package br.com.vw.uptime.schedule.core.models.alerts

import br.com.vw.uptime.schedule.infrastructure.repositories.alerts.TagData

class Tag(
    private val tagData: TagData
) {
    fun getId():String {
        return tagData.id
    }

    fun getName():String {
        return tagData.name
    }
}