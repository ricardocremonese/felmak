package br.com.vw.uptime.schedule.infrastructure.repositories.assets

import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.core.models.maintenance.AssetExtern
import br.com.vw.uptime.schedule.core.models.maintenance.AssetHistExtern
import br.com.vw.uptime.schedule.core.utils.HttpTreatment
import br.com.vw.uptime.schedule.core.utils.Json2Object
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.user.UserRoleService
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.google.gson.reflect.TypeToken
import jakarta.servlet.http.HttpServletRequest
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

@Repository
class AssetsRepository(
    val okHttpClient: OkHttpClient,
    val httpServletRequest: HttpServletRequest,
    val roleService: UserRoleService,
    val userAuthServiceImpl: UserAuthServiceImpl
) {

    @Value("\${assets.url}")
    lateinit var url:String

    @Value("\${asset_history.url}")
    lateinit var urlHistory:String

    @Value("\${rio.latam-maintenance.url}")
    lateinit var urlMaila:String

    @Value("\${rio.dev.latam-maintenance.url}")
    lateinit var urlMailaDev:String

    @Value("\${tower-account-id}")
    lateinit var towerAccountId:String

    private val contentType = "application/json"

    fun getVehicleAssets() : List<AssetExtern> {
        val token = httpServletRequest.getHeader("Authorization")
        val request = Request.Builder()
        .url("$url/assets?embed=(tags,master_data)")
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
        val listType = object : TypeToken<List<AssetExtern>>() {}.type
        val assetList: List<AssetExtern> = gson.fromJson(itemsJson, listType)
        return assetList
    }



    fun getAfterVehicleAssets(after:String?) : List<AssetExtern> {
        val token = httpServletRequest.getHeader("Authorization")
        val request = Request.Builder()
            .url("$url/assets?${insertAfter(after)}embed=(tags,master_data)")
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
        val listType = object : TypeToken<List<AssetExtern>>() {}.type
        val assetList: List<AssetExtern> = gson.fromJson(itemsJson, listType)
        return assetList
    }

    fun getAllVehicleAssets(): ArrayList<AssetExtern> {
        val allAssets = arrayListOf<AssetExtern>()
        var after:String? = null
        do {
            val currentAssets = getAfterVehicleAssets(after)
            after = currentAssets.lastOrNull()?.id
            allAssets.addAll(currentAssets)
        } while (after != null)
        return allAssets
    }

    private fun insertAfter(after: String?): String {
        if(after != null) {
            return "after=${after}&"
        }
        return ""
    }

    fun getAssetByVin(vin:String) : AssetExtern? {
        val token = httpServletRequest.getHeader("Authorization")
        val httpUrl = url.toHttpUrlOrNull()!!.newBuilder()
            .addPathSegment("assets")
            .addQueryParameter("embed", "(tags,master_data)")
            .addQueryParameter("identification", vin)
            .build()
        val request = Request.Builder()
            .url(httpUrl)
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
        val listType = object : TypeToken<List<AssetExtern>>() {}.type
        val assetList: List<AssetExtern> = gson.fromJson(itemsJson, listType)
        return assetList.firstOrNull()
    }

    fun getAssetByAssetId(assetId:String) : AssetExtern? {
        val token = httpServletRequest.getHeader("Authorization")
        val httpUrl = url.toHttpUrlOrNull()!!.newBuilder()
            .addPathSegment("assets")
            .addPathSegment(assetId)
            .addQueryParameter("embed", "(tags,master_data)")
            .build()
        val request = Request.Builder()
            .url(httpUrl)
            .addHeader("Authorization", token)
            .build()
        val response = okHttpClient.newCall(request).execute()
        HttpTreatment.throwIfNotSuccessful(response)
        val strBody = response.body?.string()
        val gson = Gson()
        // Parse the JSON object
        val asset = gson.fromJson(strBody, AssetExtern::class.java)
        return asset
    }

    fun getAssetsHistory() : List<AssetHistExtern> {
        val token = httpServletRequest.getHeader("Authorization")
        val request = Request.Builder()
            .url("$urlHistory/live-state/assets?locale=pt-BR")
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
        val listType = object : TypeToken<List<AssetHistExtern>>() {}.type
        val assetHistList: List<AssetHistExtern> = gson.fromJson(itemsJson, listType)
        return assetHistList
    }

    fun getAssetsHistoryByAssetId(assetId:String) : AssetHistExtern? {
        val token = httpServletRequest.getHeader("Authorization")
        val urlHistHttp = "$urlHistory/live-state/assets".toHttpUrl()
            .newBuilder()
            .addPathSegment(assetId)
            .addQueryParameter("locale", "pt-BR")
            .build()
        val request = Request.Builder()
            .url(urlHistHttp)
            .addHeader("Authorization", token)
            .build()
        val response = okHttpClient.newCall(request).execute()
        if(response.code != 404) {
            HttpTreatment.throwIfNotSuccessful(response)
        }
        else {
            return null
        }
        val strBody = response.body?.string()
        val gson = Gson()
        // Parse the JSON object
        val jsonObject = gson.fromJson(strBody, JsonObject::class.java)
        return gson.fromJson(jsonObject, AssetHistExtern::class.java)
    }

    fun vehicleStatusRequestDefault(assetIds:List<String>): VehicleStatusRequestData {
        return VehicleStatusRequestData(
            "NONE",
            500,
            OffsetDateTime.now().minusDays(1).format(DateTimeFormatter.ISO_DATE_TIME),
            OffsetDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME),
            assetIds,
            0
        )
    }

    fun chooseUrlMaila(user:UserAuthenticate): String {
        return if(user.accountId == towerAccountId) urlMailaDev else urlMaila
    }

    fun getVehicleStatus(assetIds:List<String>) : List<VehicleStatusData> {
        val user = userAuthServiceImpl.usr()
        val chosenMailaUrl = chooseUrlMaila(user)
        val token = httpServletRequest.getHeader("Authorization")
        val request = Request.Builder()
            .url("$chosenMailaUrl/vehicleStatus")
            .post(
                Gson().toJson(
                    vehicleStatusRequestDefault(assetIds)
                )
                .toRequestBody(contentType.toMediaType())
            )
            .addHeader("Authorization", token)
            .build()
        val response = okHttpClient.newCall(request).execute()
        HttpTreatment.throwIfNotSuccessful(response)
        val strBody = response.body?.string()
        val gson = Gson()
        // Parse the JSON object
        val jsonObject = gson.fromJson(strBody, JsonObject::class.java)
        // Extract the "items" array as a JSON string
        val itemsJson = jsonObject.getAsJsonArray("data")
        val listType = object : TypeToken<List<VehicleStatusData>>() {}.type
        val assetList: List<VehicleStatusData> = gson.fromJson(itemsJson, listType)
        return assetList
    }

    fun getVehicleStatusByAssetIdAndAccountId(assetId: String, accountId: String, token: String): VehicleStatusData? {
        val token = httpServletRequest.getHeader("Authorization")
        val request = Request.Builder()
            .url("$urlMaila/vehicleStatus?account_id=${accountId}")
            .post(
                Gson().toJson(
                    vehicleStatusRequestDefault(listOf(assetId))
                )
                    .toRequestBody(contentType.toMediaType())
            )
            .addHeader("Authorization", token)
            .build()
        val response = okHttpClient.newCall(request).execute()
        val strBody = response.body?.string()
        treatResponse(response, strBody!!)
        HttpTreatment.throwIfNotSuccessful(response, strBody)
        val gson = Gson()
        // Parse the JSON object
        val jsonObject = gson.fromJson(strBody, JsonObject::class.java)
        // Extract the "items" array as a JSON string
        val itemsJson = jsonObject.getAsJsonArray("data")
        val listType = object : TypeToken<List<VehicleStatusData>>() {}.type
        val assetList: List<VehicleStatusData> = gson.fromJson(itemsJson, listType)
        return assetList.firstOrNull()
    }

    fun getInstantDiagnosticByAssets(assetIds: List<String>) : List<InstantDiagnosticData> {
        val user = userAuthServiceImpl.usr()
        val chosenMailaUrl = chooseUrlMaila(user)
        val token = httpServletRequest.getHeader("Authorization")
        val httpUrl = chosenMailaUrl.toHttpUrlOrNull()!!.newBuilder().apply {
            addPathSegment("instant-diagnostics")
        }.build()

        val request = Request.Builder()
            .url(httpUrl)
            .addHeader("Authorization", token)
            .post(
                Gson().toJson(
                    InstantDiagnosticRequest(
                        assetIds = assetIds,
                        signTypes = arrayListOf(
                            "TOTAL_DISTANCE",
                            "ENGINE_HOURS"
                        )
                    )
                ).toRequestBody(contentType.toMediaType())
            )
            .build()
        val response = okHttpClient.newCall(request).execute()
        val strBody = response.body?.string()
        if(!response.isSuccessful) {
            if(strBody?.contains("404 : [no body]") == true) {
                return emptyList()
            } else {
                HttpTreatment.throwIfNotSuccessful(response, strBody)
            }
        }
        return Json2Object.toObject(strBody!!)
    }

    private fun treatResponse(response: Response, strBody: String) {
        if(response.code == 500) {
            if(strBody.contains("404 : [no body]")) {
                throw BusinessException(
                    ErrorCode.ENTITY_NOT_FOUND.toResponse()
                )
            }
        }

    }
}

class VehicleStatusData(
    val vehicleId:String,
    val vehicle:String?,
    val status:String?,
    val engineHours:String?,
    val totalDistance:String?,
    val dealershipCity:String?,
    val dealershipName:String?,
    val distanceFromDealership:String?,
    val nextService:String
)

data class VehicleStatusRequestData(
    val filterType: String,
    val pageSize: Long,
    val startAt: String,
    val endAt: String,
    val assetIds: List<String>,
    val page: Long,
)

class InstantDiagnosticData(
    val id:String,
    val assetId:String,
    val type:String,
    val value:Double,
    val refUtc:String
)

class InstantDiagnosticRequest(
    val assetIds:List<String>,
    val signTypes:List<String>
)