package br.com.vw.uptime.schedule.entrypoint.responses

import java.time.LocalDateTime

class StateHistoryItemResponse {
    lateinit var state: String
    lateinit var  date: LocalDateTime
    var scheduleDate:LocalDateTime? = null
}