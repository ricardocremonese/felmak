package br.com.vw.uptime.schedule.entrypoint.responses.occurrence

import java.time.LocalDateTime

data class ServiceBayResponse(
    val id: String,
    val name: String,
    val dn: String,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val active: Boolean
) 