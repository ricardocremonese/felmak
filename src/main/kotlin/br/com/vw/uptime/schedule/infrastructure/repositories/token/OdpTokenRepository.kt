package br.com.vw.uptime.schedule.infrastructure.repositories.token

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Repository


@Repository
class OdpTokenRepository(
    private val odpTokenBaseRepository:OdpTokenBaseRepository
) : OAuthRepository {

    @Value("\${rio.gateway.service.odp.url}")
    lateinit var rioGatewayServiceOdp:String

    @Value("\${rio.gateway.service.odp.client_id}")
    lateinit var clientId:String

    @Value("\${rio.gateway.service.odp.client_secret}")
    lateinit var clientSecret:String

    override fun getToken() : TokenResponse {
        return odpTokenBaseRepository.getToken(
            odpTokenUrl = rioGatewayServiceOdp,
            clientId = clientId,
            clientSecret = clientSecret
        )
    }

}