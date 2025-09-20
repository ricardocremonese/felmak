package br.com.vw.uptime.schedule.entrypoint.responses.occurrence

import java.time.LocalDate
import java.time.YearMonth

data class OccurrenceQuantityResponse(val monthly: Map<String, List<Month>>, val daily: Map<String, List<Daily>>)

data class Daily(val day: LocalDate?, val quantity: Int? = 0, val chassisList: List<String> = emptyList(), val occurrenceUuidList: List<String> = emptyList())
data class Month(val yearMonth: YearMonth, val quantity: Int? = 0, val chassisList: List<String> = emptyList(), val occurrenceUuidList: List<String> = emptyList())
