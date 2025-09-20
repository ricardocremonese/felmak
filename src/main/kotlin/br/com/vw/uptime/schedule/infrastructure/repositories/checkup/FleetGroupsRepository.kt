package br.com.vw.uptime.schedule.infrastructure.repositories.checkup

import br.com.vw.uptime.schedule.core.utils.HttpTreatment
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.google.gson.reflect.TypeToken
import jakarta.servlet.http.HttpServletRequest
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service


@Service
class FleetGroupsRepository(
    val okHttpClient: OkHttpClient,
    val httpServletRequest: HttpServletRequest
) {

    @Value("\${tags.url}")
    lateinit var url:String

    fun getFleetGroupsByAccountId(accountId:String) : List<FleetGroupData> {
        val token = httpServletRequest.getHeader("Authorization")
        val urlSplitted = url.split("://")
        val schema = urlSplitted[0]
        val host = urlSplitted[1]
        val urlQuery = with(HttpUrl.Builder()) {
            scheme(schema)
            .host(host)
            .addPathSegment("tags")
            if(accountId.isNotEmpty())
                addQueryParameter("account_id", accountId)
            build()
        }

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
        // Extract the "items" array as a JSON string
        val itemsJson = jsonObject.getAsJsonArray("items")
        val listType = object : TypeToken<List<FleetGroupData>>() {}.type
        val list = gson.fromJson<ArrayList<FleetGroupData>>(itemsJson, listType)
        list.add(
            FleetGroupData(
                "",
                "Sem Grupo"
            )
        )
        return list
    }

}

data class FleetGroupData(
    val id:String,
    val name:String
)