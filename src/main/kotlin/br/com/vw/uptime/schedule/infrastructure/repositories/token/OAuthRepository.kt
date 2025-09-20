package br.com.vw.uptime.schedule.infrastructure.repositories.token

interface OAuthRepository {
    fun getToken() : TokenResponse
}