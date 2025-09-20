package br.com.vw.uptime.schedule.infrastructure.repositories.token

import br.com.vw.uptime.schedule.core.utils.HttpTreatment
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Repository

@Repository
class OAuthRioRepository : OAuthRepository {

    @Value("\${oauth.url}")
    lateinit var url:String

    @Value("\${oauth.basic}")
    lateinit var basicAuth:String

    @Value("\${oauth.client_id}")
    lateinit var clientId:String

    override fun getToken() : TokenResponse {
        val okHttpClient = OkHttpClient()

        val formBody = FormBody.Builder()
            .add("client_id", clientId)
            .add("grant_type", "client_credentials")
            .build()

        val request = Request.Builder()
            .url(url)
            .addHeader("Authorization", "Basic $basicAuth")
            .post(formBody)
            .build()

        val response = okHttpClient.newCall(request).execute()
        HttpTreatment.throwIfNotSuccessful(response)
        val gson = Gson()
        val tokenResponse =  gson.fromJson(response.body!!.string(), TokenResponse::class.java)
        return tokenResponse
    }

}

class TokenResponse(
    @SerializedName("access_token")
    val accessToken:String,
    @SerializedName("exp")
    val exp:Long,
    @SerializedName("expires_in")
    val expiresIn:Long
)