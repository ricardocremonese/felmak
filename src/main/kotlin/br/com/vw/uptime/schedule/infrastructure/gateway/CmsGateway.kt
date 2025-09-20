package br.com.vw.uptime.schedule.infrastructure.gateway

import br.com.vw.uptime.schedule.core.configs.properties.CmsProperties
import br.com.vw.uptime.schedule.infrastructure.gateway.response.ManualDigitalResponse
import com.fasterxml.jackson.databind.ObjectMapper
import okhttp3.Credentials
import okhttp3.OkHttpClient
import okhttp3.Request
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Component
import java.lang.String.format

@Component
class CmsGateway(val cmsProperties: CmsProperties,
                 okHttpClient: OkHttpClient,
                 objectMapper: ObjectMapper) : AbstractGateway(okHttpClient, objectMapper) {

    fun getManual(chassis: String) : ManualDigitalResponse? {

        val request = Request.Builder()
            .url(format("%s/json/portal/digitalManual?chassi=%s", cmsProperties.url, chassis))
            .header(HttpHeaders.AUTHORIZATION, Credentials.basic(cmsProperties.username, cmsProperties.passwd))
            .get()
            .build()

        return rawExecute<ManualDigitalResponse>(request)
    }
}