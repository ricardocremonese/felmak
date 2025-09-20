package br.com.vw.uptime.schedule.infrastructure.gateway

import br.com.vw.uptime.schedule.infrastructure.gateway.response.ManualDigitalResponse
import com.fasterxml.jackson.databind.ObjectMapper
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.lang.String.format


@Component
class RioGateway(okHttpClient: OkHttpClient, objectMapper: ObjectMapper) : AbstractGateway(okHttpClient, objectMapper) {

    companion object {
        private val log = LoggerFactory.getLogger(RioGateway::class.java)
    }

    @Value("\${rio.gateway.service.url}")
    lateinit var rioGatewayServiceUrl:String

    fun getManual(type: String,  body: String) : List<ManualDigitalResponse>? {
        val request = Request.Builder()
            .url(format("%s/processamento?tipo=%s", rioGatewayServiceUrl, type))
            .post(body.toRequestBody(type.toMediaTypeOrNull()))
            .build()

        return rawExecute<List<ManualDigitalResponse>>(request)
    }
}