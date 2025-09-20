package br.com.vw.uptime.schedule.core.models.schedule.input

import java.time.LocalDateTime

class StateHistoryItem {
    lateinit var state:String
    lateinit var date:LocalDateTime
    var scheduleDate:LocalDateTime? = null
}
