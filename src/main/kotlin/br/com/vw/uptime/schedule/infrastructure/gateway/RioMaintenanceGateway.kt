package br.com.vw.uptime.schedule.infrastructure.gateway

import br.com.vw.uptime.schedule.infrastructure.gateway.request.AssetIdsRequest
import br.com.vw.uptime.schedule.infrastructure.gateway.response.FaultCodesCardResponse
import br.com.vw.uptime.schedule.infrastructure.services.report.VehicleStatusRequest
import br.com.vw.uptime.schedule.infrastructure.services.report.VehicleStatusResponse
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.servlet.http.HttpServletRequest
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType.APPLICATION_JSON_VALUE
import org.springframework.stereotype.Component


@Component
class RioMaintenanceGateway(private val httpServletRequest: HttpServletRequest, okHttpClient: OkHttpClient, objectMapper: ObjectMapper) : AbstractGateway(okHttpClient, objectMapper) {

    private val log = LoggerFactory.getLogger(PlatformNotificationGateway::class.java)

    @Value("\${rio.latam-maintenance.url}")
    private lateinit var rioGatewayServiceUrl:String

    @Value("\${rio.dev.latam-maintenance.url}")
    private lateinit var devRioGatewayServiceUrl:String

    @Value("\${tower-account-id}")
    private lateinit var controlTowerAccountId: String

    fun getFaultCodesCard(body: AssetIdsRequest) : FaultCodesCardResponse {
        val request = Request.Builder()
            .url("$rioGatewayServiceUrl/vehicleStatus/faultCodesCard")
            .header(HttpHeaders.AUTHORIZATION, httpServletRequest.getHeader(HttpHeaders.AUTHORIZATION))
            .header(HttpHeaders.CONTENT_TYPE, APPLICATION_JSON_VALUE)
            .post(objectMapper.writeValueAsString(body).toRequestBody())
            .build()
        return rawExecute<FaultCodesCardResponse>(request)
    }

    fun getVehiclesByStatus(body: VehicleStatusRequest, accountId: String) : VehicleStatusResponse {

        val endpoint = if(accountId == controlTowerAccountId) devRioGatewayServiceUrl else rioGatewayServiceUrl

        log.info("AccountId $accountId. Consulta de veículos por status através do endpoint $endpoint")
        val request = Request.Builder()
            .url("$endpoint/vehicleStatus")
            .header(HttpHeaders.AUTHORIZATION, httpServletRequest.getHeader(HttpHeaders.AUTHORIZATION))
            .header(HttpHeaders.CONTENT_TYPE, APPLICATION_JSON_VALUE)
            .post(objectMapper.writeValueAsString(body).toRequestBody())
            .build()
        return rawExecute<VehicleStatusResponse>(request)
    }
}

