package br.com.vw.uptime.schedule.core.filters

import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import com.google.gson.Gson
import com.nimbusds.jwt.JWTClaimsSet
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import java.util.*


class Auth(
    private val request: HttpServletRequest,
    private val response: HttpServletResponse,
    private val jwksUrl: String
) {

    fun authenticate(): Boolean {
        if (isAuthenticationNeeded()) {
            return checkAuthorization()
        }
        return true
    }

    private fun isAuthenticationNeeded():Boolean {
        val privateRoutes = listOf("/v1", "/v2")
        return privateRoutes.any { request.requestURI.contains(it) }
    }

    private fun checkAuthorization() :Boolean {
        val bearerToken: String? = request.getHeader("Authorization")
        if(bearerToken.isNullOrBlank()) {
            respondUnauthorized()
            return false
        }

        val token = bearerToken.replace("Bearer ", "")
        val jwtVerifier = JwtVerifier(jwksUrl)
        val tokenDecoded = jwtVerifier.verifyAndDecode(token)
        if(tokenDecoded == null) {
            respondUnauthorized()
            return false
        }
        if(isTokenExpired(tokenDecoded)) {
            respondExpiredToken()
            return false
        } else{
            val userAuthenticate = UserAuthenticate(
                sub = tokenDecoded.subject,
                accountId = tokenDecoded.getClaim("account").toString(),
                userId = extractUserId(tokenDecoded),
                scope = tokenDecoded.getClaim("scope").toString(),
            )
            request.setAttribute("authenticate", userAuthenticate)
            return true
        }
    }

    private fun extractUserId(tokenDecoded: JWTClaimsSet): String {
        val sub = tokenDecoded.getClaim("sub").toString()
        val userId = sub.split(":")[1]
        return userId
    }


    private fun isTokenExpired(tokenDecoded:JWTClaimsSet) : Boolean {
        return tokenDecoded.expirationTime.before(Date())
    }

    private fun respondExpiredToken() {
        val gson = Gson()
        response.apply {
            status = HttpServletResponse.SC_UNAUTHORIZED
            characterEncoding = "UTF-8"
            contentType = "application/json"
            writer.write(
                gson.toJson(
                    ResponseError(
                        ErrorCode.EXPIRED_TOKEN.code,
                        ErrorCode.EXPIRED_TOKEN.message
                    )
                )
            )
        }
    }

    private fun respondUnauthorized() {
        val gson = Gson()
        response.apply {
            status = HttpServletResponse.SC_UNAUTHORIZED
            characterEncoding = "UTF-8"
            contentType = "application/json"
            writer.write(
                gson.toJson(
                    ResponseError(
                        ErrorCode.NOT_AUTHORIZED.code,
                        ErrorCode.NOT_AUTHORIZED.message
                    )
                )
            )
        }
    }
}

class ResponseError(val code:String, val message:String)