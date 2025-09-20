package br.com.vw.uptime.schedule.infrastructure.repositories.assets

import br.com.vw.uptime.schedule.core.utils.HttpTreatment
import br.com.vw.uptime.schedule.core.utils.Json2Object
import com.fasterxml.jackson.annotation.JsonProperty
import com.google.gson.annotations.SerializedName
import jakarta.servlet.http.HttpServletRequest
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Repository

@Repository
class AssociationRepository(
    val okHttpClient: OkHttpClient,
    val httpServletRequest: HttpServletRequest
) {

    @Value("\${assets.url}")
    lateinit var url:String

    fun getAssociations(afterUUID:String? = null) : List<AssociationData> {
        val token = httpServletRequest.getHeader("Authorization")
        val httpUrl = url.toHttpUrlOrNull()!!.newBuilder().apply {
            addPathSegment("associations")
            addQueryParameter("embed", "(device)")
            afterUUID?.let { addQueryParameter("after", it) }
        }.build()

        val request = Request.Builder()
            .url(httpUrl)
            .addHeader("Authorization", token)
            .build()
        val response = okHttpClient.newCall(request).execute()
        HttpTreatment.throwIfNotSuccessful(response)
        val strBody = response.body?.string()
        return Json2Object.toObjectFromAttribute(strBody!!, "items")
    }

    fun getAssociationsAsset(afterUUID:String? = null) : List<AssociationData> {
        val token = httpServletRequest.getHeader("Authorization")
        val httpUrl = url.toHttpUrlOrNull()!!.newBuilder().apply {
            addPathSegment("associations")
            addQueryParameter("embed", "(asset)")
            afterUUID?.let { addQueryParameter("after", it) }
        }.build()

        val request = Request.Builder()
            .url(httpUrl)
            .addHeader("Authorization", token)
            .build()
        val response = okHttpClient.newCall(request).execute()
        HttpTreatment.throwIfNotSuccessful(response)
        val strBody = response.body?.string()
        return Json2Object.toObjectFromAttribute(strBody!!, "items")
    }

}

class AssociationData (
    val id: String,
    @SerializedName("device_id")
    val deviceId: String,
    @SerializedName("asset_id")
    val assetId: String,
    @SerializedName("_embedded")
    val embedded: Embedded
)

data class Embedded(
    val device: Device,
)

data class Device(
    val id: String,
    val identification: String,
    val type: String,
)