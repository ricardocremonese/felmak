package br.com.vw.uptime.schedule.core.filters

open class UserAuthenticate (
    val sub: String,
    val scope: String,
    val accountId: String,
    val userId: String
)

