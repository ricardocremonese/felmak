package br.com.vw.uptime.schedule.core.models.schedule.input

import java.time.LocalDateTime

class RescheduleInput {
    lateinit var id:String
    lateinit var rescheduleDate:LocalDateTime
}