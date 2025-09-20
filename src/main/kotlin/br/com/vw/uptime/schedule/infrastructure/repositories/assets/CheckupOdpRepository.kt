package br.com.vw.uptime.schedule.infrastructure.repositories.assets

import br.com.vw.uptime.schedule.core.utils.HttpTreatment
import br.com.vw.uptime.schedule.infrastructure.repositories.dealerships.DealershipData
import br.com.vw.uptime.schedule.infrastructure.repositories.token.CachedTokenRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.token.OdpTokenRepository
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
class CheckupOdpRepository(
    private val okHttpClient: OkHttpClient,
    private val objectMapper: ObjectMapper,
    odpTokenRepository: OdpTokenRepository) {

    val cachedTokenRepository = CachedTokenRepository(odpTokenRepository)

    @Value("\${rio.gateway.service.odp.url}")
    lateinit var rioGatewayServiceOdp:String

    private val log = LoggerFactory.getLogger(CheckupOdpRepository::class.java)

    @Deprecated(message = "Use the repository UptimeAssetRepository instead of")
    fun getVehicleInfoAndCheckups(chassisList:List<String>) : List<CheckupOdpData> {
        if(chassisList.isEmpty()) {
            return listOf()
        }
        val httpUrl = rioGatewayServiceOdp.toHttpUrl().newBuilder().apply {
            addPathSegment("processamento")
            addQueryParameter("tipo", "stampService")
        }.build()

        val request = Request.Builder()
            .url(httpUrl)
            .header("Authorization", "Bearer ${cachedTokenRepository.getToken()}")
            .header("Content-Type", "text/plain")
            .post(chassisListToString(chassisList).toRequestBody())
            .build()
        val response = okHttpClient.newCall(request).execute()
        HttpTreatment.throwIfNotSuccessful(response)
        val strBody = response.body?.string()
        if(strBody.isNullOrBlank()) {
            return listOf()
        }
        return objectMapper.readValue<List<CheckupOdpData>>(strBody)
    }

    fun getDealerships(latitude: Double, longitude: Double, distance: Double): List<DealershipData>{
        val httpUrl = rioGatewayServiceOdp.toHttpUrl().newBuilder().apply {
            addPathSegment("processamento")
            addQueryParameter("tipo", "dealerService")
        }.build()

        val request = Request.Builder()
            .url(httpUrl)
            .header("Authorization", "Bearer ${cachedTokenRepository.getToken()}")
            .header("Content-Type", "text/plain")
            .post("$latitude,$longitude,$distance".toRequestBody())
            .build()
        val response = okHttpClient.newCall(request).execute()
        HttpTreatment.throwIfNotSuccessful(response)
        val strBody = response.body?.string()
        if(strBody.isNullOrBlank()) {
            log.info("Nenhuma concessionária localizada para as coordenadas [{},{}] em um raio de [{}] km", latitude, longitude, distance)
            return listOf()
        }
        return objectMapper.readValue<List<DealershipData>>(strBody)
    }

    private fun chassisListToString(chassisList: List<String>): String {
        return chassisList.joinToString(",")
    }
}

data class  CheckupOdpData(
    val chassis: String,
    val maintenanceGroup: String? = null,
    val modelDescription: String? = null,
    val modelCode: String? = null,
    val order: OrderData?,
    val warranty: WarrantyData?,
    val volkstotal: VolksTotalData?,
    val revisions: List<RevisionData>? = null,
)

data class WarrantyData(
    val start: LocalDateTime? = null,
    val end: LocalDateTime? = null,
    val generalStart: LocalDateTime? = null,
    val generalEnd: LocalDateTime? = null,
    val additionalStart: LocalDateTime? = null,
    val additionalEnd: LocalDateTime? = null,
    val specialStart: LocalDateTime? = null,
)

data class VolksTotalData(
    val status: String?,
    val contractNumber: String?,
    val modality: String?,
)

data class RevisionData(
    val volkscareRevision: String?,
    val hourMeter: String?,
    val mileage: Long?,
    val revisionDate: String,
    val dealer: String?,
    val consultantName:String?,
    val revisionType: String?,
    val revisionCode: String?,
    val serviceOrder: String?
)

data class OrderData(
    val saleOrder: String?
)