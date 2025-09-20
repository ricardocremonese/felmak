package br.com.vw.uptime.schedule.infrastructure.repositories.token

import br.com.vw.uptime.schedule.core.utils.Cached
import java.time.Instant

class CachedTokenRepository(
    private val oAuthRepository: OAuthRepository
) {

    private var cachedToken = Cached {
        oAuthRepository.getToken()
    }

    fun getToken() : String {
        if(cachedToken.isEmpty()) {
            return cachedToken.get().accessToken
        }
        if(checkExpired()) {
            return cachedToken.refresh().accessToken
        }
        return cachedToken.get().accessToken
    }

    private fun checkExpired(): Boolean {
        val expInstant = Instant.ofEpochSecond(cachedToken.get().exp)
        return expInstant.isBefore(Instant.now())
    }

}