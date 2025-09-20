package br.com.vw.uptime.schedule.infrastructure.repositories.token

import br.com.vw.uptime.schedule.core.utils.HttpTreatment
import com.google.gson.JsonParser
import okhttp3.FormBody
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import org.springframework.http.MediaType
import org.springframework.stereotype.Repository
import java.time.Instant

@Repository
class OdpTokenBaseRepository {

    fun getToken(odpTokenUrl:String, clientId:String, clientSecret:String) : TokenResponse {

        val httpUrl = odpTokenUrl.toHttpUrl()
            .newBuilder()
            .addPathSegment("oauth2")
            .addPathSegment("token")
            .build()

        val okHttpClient = OkHttpClient()

        val formBody = FormBody.Builder()
            .add("client_id", clientId)
            .add("client_secret", clientSecret)
            .build()

        val request = Request.Builder()
            .url(httpUrl)
            .post(formBody)
            .addHeader("Content-Type", MediaType.APPLICATION_FORM_URLENCODED_VALUE)
            .build()

        val response = okHttpClient.newCall(request).execute()
        HttpTreatment.throwIfNotSuccessful(response)
        val responseBody = response.body!!.string()
        val tokenResponseJson =  JsonParser.parseString(responseBody).asJsonObject
        val expiresIn = tokenResponseJson.get("expires_in").asLong
        return TokenResponse(
            accessToken = tokenResponseJson.get("access_token").asString,
            exp = calculateDateTimeExpiration(expiresIn),
            expiresIn = expiresIn
        )
    }

    private fun calculateDateTimeExpiration(expireIn:Long) : Long {
        val secondMargin:Long = 30
        val expireInWithMargin = expireIn - secondMargin
        return Instant.now().plusSeconds(expireInWithMargin).epochSecond
    }

}