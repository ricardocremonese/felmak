package br.com.vw.uptime.schedule.infrastructure.repositories.token

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Repository

@Repository
class OdpOccurrenceTokenRepository(
    private val odpTokenBaseRepository: OdpTokenBaseRepository
) : OAuthRepository {

    @Value("\${odp.dynamics.occurrence.url}")
    lateinit var occurrenceDynamicsUrl:String

    @Value("\${odp.dynamics.occurrence.client_id}")
    lateinit var clientId:String

    @Value("\${odp.dynamics.occurrence.client_secret}")
    lateinit var clientSecret:String


    override fun getToken(): TokenResponse {
        return odpTokenBaseRepository.getToken(
            odpTokenUrl = occurrenceDynamicsUrl,
            clientId = clientId,
            clientSecret = clientSecret
        )
    }

}