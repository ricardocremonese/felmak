package br.com.vw.uptime.schedule.infrastructure.repositories.alerts

import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.utils.HttpTreatment
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import com.google.gson.Gson
import com.google.gson.JsonParser
import com.google.gson.reflect.TypeToken
import jakarta.servlet.http.HttpServletRequest
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Repository

@Repository
class AlertsRepository(
    val okHttpClient: OkHttpClient,
    val httpServletRequest: HttpServletRequest
) {

    @Value("\${rio.latam-maintenance.url}")
    lateinit var url:String

    fun getAlerts(alertData: AlertRequest): AlertData {

        val token = httpServletRequest.getHeader("Authorization")
        val urlSplitted = url.split("://")
        val schema = urlSplitted[0]
        val host = urlSplitted[1].split("/")[0]
        val contextPath = urlSplitted[1].split("/")[1]
        val urlQuery = with(HttpUrl.Builder()) {
            scheme(schema)
                .host(host)
                .addPathSegment(contextPath)
                .addPathSegment("faultCodes")
            build()
        }

        val request = Request.Builder()
            .url(urlQuery)
            .addHeader("Authorization", token)
            .addHeader("content-type", MediaType.APPLICATION_JSON_VALUE)
            .post(Gson().toJson(alertData).toRequestBody())
            .build()

        val response = okHttpClient.newCall(request).execute()
        throwBusinessWhenNoAlerts(response)
        HttpTreatment.throwIfNotSuccessful(response)
        val strBody = response.body?.string()
        val gson = Gson()
        val listType = object : TypeToken<AlertData>() {}.type
        val list = gson.fromJson<AlertData>(strBody, listType)
        return list
    }

    private fun throwBusinessWhenNoAlerts(response: Response) {
        if(response.code == 404 || response.code == 400) {
            val body = response.body?.string()
            val jsonElement = JsonParser.parseString(body).asJsonObject
            throw BusinessException(
                ErrorCodeResponse(
                    jsonElement["code"].asString,
                    jsonElement["message"].asString
                )
            )
        } else if(response.code == 500) {
            val body = response.body?.string()
            val jsonElement = JsonParser.parseString(body).asJsonObject
            if(jsonElement["message"].asString == "404 : [no body]") {
                throw BusinessException(
                    ErrorCodeResponse(
                        "no.body",
                        "No response body"
                    )
                )
            } else {
                throw BusinessException(
                    ErrorCodeResponse(
                        jsonElement["code"].asString,
                        jsonElement["message"].asString
                    )
                )
            }
        }
    }

}

data class AlertRequest(
    val pageSize: Long,
    val page: Long,
    val assetIds: List<String>,
    val tagIds: List<String>,
    val startAt: String,
    val endAt: String,
    val search: String,
    val zone: String,
)


data class AlertData (
    val data: List<DataData>,
    val total: TotalData,
)

data class DataData(
    val id: String,
    val vehicleId: String,
    val vehicle: String,
    val vin: String,
    val date: String,
    val description: String,
    val spn: String,
    val spnDescription: String,
    val fmi: String,
    val fmiDescription: String,
    val lampStatus: String,
    val latitude: Double,
    val longitude: Double,
    val sourceAddress: String,
    val km: String,
    val tags: List<TagData>,
)

data class TagData(
    val id: String,
    val name: String,
)

data class TotalData(
    val total: Long,
    val totalAttentionAlert: Long,
    val totalCriticalAlert: Long,
)