package br.com.vw.uptime.schedule.core.filters

import com.nimbusds.jose.JWSVerifier
import com.nimbusds.jose.crypto.RSASSAVerifier
import com.nimbusds.jose.jwk.JWKSet
import com.nimbusds.jose.jwk.RSAKey
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import java.net.URL

class JwtVerifier(jwksUrl: String) {
    private val jwsVerifier: JWSVerifier

    init {
        val jwkSet = JWKSet.parse(URL(jwksUrl).readText())
        val rsaKeys = jwkSet.keys.filterIsInstance<RSAKey>().map { it }
        val publicKey = rsaKeys.first().toRSAPublicKey()
        jwsVerifier = RSASSAVerifier(publicKey)
    }

    fun verifyAndDecode(token: String): JWTClaimsSet? {
        try {
           val signedJWT = SignedJWT.parse(token)
            return if (signedJWT.verify(jwsVerifier)) {
                signedJWT.jwtClaimsSet
            } else {
                null
            }
        } catch (_:Exception) {
            return null
        }
    }
}