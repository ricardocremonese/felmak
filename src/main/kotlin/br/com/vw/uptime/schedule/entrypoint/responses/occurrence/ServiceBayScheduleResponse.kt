package br.com.vw.uptime.schedule.entrypoint.responses.occurrence

import java.time.LocalDateTime

data class ServiceBayScheduleResponse(
    val id: String,
    val startDate: LocalDateTime?,
    val endDate: LocalDateTime?,
    val dn: String?,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val active: Boolean,
    val createdBy: String?,
    val createdById: String?,
    val serviceBay: ServiceBayResponse?
) 