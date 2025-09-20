package br.com.vw.uptime.schedule.infrastructure.gateway.request

data class AccountIdsRequest(
    val accountIds: Set<String>
)