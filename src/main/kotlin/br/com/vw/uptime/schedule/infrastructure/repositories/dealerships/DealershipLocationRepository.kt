package br.com.vw.uptime.schedule.infrastructure.repositories.dealerships

import br.com.vw.uptime.schedule.core.utils.HttpTreatment
import br.com.vw.uptime.schedule.infrastructure.services.dealership.DealershipServiceImpl
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.google.gson.reflect.TypeToken
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Repository

@Repository
class DealershipLocationRepository(
    val okHttpClient: OkHttpClient
) {

    @Value("\${rio.gateway.service.url}")
    lateinit var url:String


    fun dealersByLocation(latitude: Double, longitude: Double, distance: Long) : List<DealershipData> {
        val urlSplitted = url.split("://")
        val schema = urlSplitted[0]
        val host = urlSplitted[1]

        val urlRequest = HttpUrl.Builder()
            .scheme(schema)
            .host(host)
            .addPathSegment("dealers")
            .addPathSegment("dealers")
            .addPathSegment(latitude.toString())
            .addPathSegment(longitude.toString())
            .addPathSegment(distance.toString())
            .build()

        val request = Request.Builder()
            .url(urlRequest)
            .url("$url/processamento?tipo=dealerService")
            .post("$latitude,$longitude,$distance".toRequestBody())
            .build()

        val response = okHttpClient.newCall(request).execute()
        HttpTreatment.throwIfNotSuccessful(response)
        val strBody = response.body?.string()
        val gson = Gson()

        val listType = object : TypeToken<List<DealershipData>>() {}.type
        val list = gson.fromJson<List<DealershipData>>(strBody, listType)
        return list
    }

    fun dealerships() : List<DealershipData> {
        val urlSplitted = url.split("://")
        val schema = urlSplitted[0]
        val host = urlSplitted[1]

        val urlRequest = HttpUrl.Builder()
            .scheme(schema)
            .host(host)
            .addPathSegment("dealers")
            .addPathSegment("dealers")
            .build()

        val request = Request.Builder()
            .url(urlRequest)
            .build()

        val response = okHttpClient.newCall(request).execute()
        HttpTreatment.throwIfNotSuccessful(response)
        val strBody = response.body?.string()
        val gson = Gson()

        val jsonObject = gson.fromJson(strBody, JsonObject::class.java)
        // Extract the "items" array as a JSON string
        val itemsJson = jsonObject.getAsJsonArray("data")

        val listType = object : TypeToken<List<DealershipData>>() {}.type
        val list = gson.fromJson<List<DealershipData>>(itemsJson, listType)
        return list
    }
}