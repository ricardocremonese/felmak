package br.com.vw.uptime.schedule.entrypoint.responses

import java.time.LocalDateTime
import java.util.*

class ScheduleResponse {

    lateinit var id: UUID
    lateinit var state: String
    lateinit var booking: String
    lateinit var sourceAccountId: String
    lateinit var sourceUserId: String
    lateinit var createdDate: LocalDateTime
    lateinit var scheduledDate: LocalDateTime
    lateinit var destinationAccountId: String
    lateinit var destinationUserId: String
    lateinit var stateHistory: List<StateHistoryItemResponse>
}