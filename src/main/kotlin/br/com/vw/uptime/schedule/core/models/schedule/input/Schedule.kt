package br.com.vw.uptime.schedule.core.models.schedule.input

import java.time.LocalDateTime
import java.util.*

class Schedule {
    lateinit var id: UUID
    lateinit var booking: String
    lateinit var state: String
    lateinit var scheduledDate: LocalDateTime
    lateinit var createdDate: LocalDateTime
    lateinit var sourceAccountId: String
    lateinit var sourceUserId: String
    var sourceUserName: String? = null
    lateinit var destinationAccountId: String
    lateinit var destinationUserId: String
    lateinit var stateHistory: List<StateHistoryItem>
}