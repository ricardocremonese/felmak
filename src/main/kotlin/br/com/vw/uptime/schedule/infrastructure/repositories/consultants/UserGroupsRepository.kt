package br.com.vw.uptime.schedule.infrastructure.repositories.consultants

import br.com.vw.uptime.schedule.core.utils.HttpTreatment
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
class UserGroupsRepository(
    val okHttpClient: OkHttpClient,
    val httpServletRequest: HttpServletRequest
) {

    @Value("\${users.url}")
    lateinit var url:String

    fun groups() : List<UserGroupData> {

        val urlSplitted = url.split("://")
        val schema = urlSplitted[0]
        val host = urlSplitted[1]
        val urlQuery = with(HttpUrl.Builder()) {
            scheme(schema)
            .host(host)
            .addPathSegment("user-management")
            .addPathSegment("groups")
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
        val jsonObject = gson.fromJson(strBody, JsonObject::class.java)
        val itemsJson = jsonObject.getAsJsonArray("items")
        val listType = object : TypeToken<List<UserGroupData>>() {}.type
        val list = gson.fromJson<List<UserGroupData>>(itemsJson, listType)
        return list
    }

    fun groupsByName(userGroupName:String) : UserGroupData? {
        return groups().firstOrNull {
            it.name == userGroupName
        }
    }

}


data class UserGroupData(
    val id: String,
    val name: String,
    @SerializedName("account_id")
    val accountId: String,
    val description: String,
)