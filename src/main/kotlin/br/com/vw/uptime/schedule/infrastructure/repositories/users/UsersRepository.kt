package br.com.vw.uptime.schedule.infrastructure.repositories.users

import br.com.vw.uptime.schedule.core.utils.HttpTreatment
import br.com.vw.uptime.schedule.infrastructure.services.user.*
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.google.gson.annotations.SerializedName
import com.google.gson.reflect.TypeToken
import jakarta.servlet.http.HttpServletRequest
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Repository

@Repository
class UsersRepository(
    val okHttpClient: OkHttpClient,
    val httpServletRequest: HttpServletRequest
) {

    @Value("\${users.url}")
    lateinit var url:String

    fun getUserById(userId: String) : User {

        val urlSplitted = url.split("://")
        val schema = urlSplitted[0]
        val host = urlSplitted[1]
        val urlQuery = with(HttpUrl.Builder()) {
            scheme(schema)
            .host(host)
            .addPathSegment("user-management")
            .addPathSegment("users")
            .addPathSegment(userId)
            build()
        }

        val token = httpServletRequest.getHeader("Authorization")
        val request = Request.Builder()
            .url(urlQuery)
            .addHeader("Authorization", token)
            .build()
        
        val response = okHttpClient.newCall(request).execute()
        HttpTreatment.throwIfNotSuccessful(response)

        val strBody = response.body?.string()
        val gson = Gson()
        // Parse the JSON object
        val jsonObject = gson.fromJson(strBody, JsonObject::class.java)
        val user = gson.fromJson(jsonObject, User::class.java)
        return user
    }
}

data class User(
    val id: String,
    @SerializedName("account_id")
    val accountId: String,
    @SerializedName("first_name")
    val firstName: String,
    @SerializedName("last_name")
    val lastName: String,
    val email: String,
    @SerializedName("phone_number")
    val phoneNumber: String,
    @SerializedName("group_ids")
    val groupIds: List<String>
)