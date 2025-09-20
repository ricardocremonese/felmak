package br.com.vw.uptime.schedule.infrastructure.gateway

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.servlet.http.HttpServletRequest
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Component

@Component
class PlatformNotificationGateway(private val httpServletRequest: HttpServletRequest, okHttpClient: OkHttpClient, objectMapper: ObjectMapper) : AbstractGateway(okHttpClient, objectMapper) {
    val log = LoggerFactory.getLogger(PlatformNotificationGateway::class.java)

    @Value("\${rio.platform.notification.url}")
    private lateinit var notificationUrl:String

    fun sendNotification(pushNotificationRequest: PushNotificationRequest) {
        val requestBody = objectMapper.writeValueAsString(pushNotificationRequest)
        val request = Request.Builder()
            .url(notificationUrl)
            .header(HttpHeaders.AUTHORIZATION, httpServletRequest.getHeader(HttpHeaders.AUTHORIZATION))
            .post(requestBody.toRequestBody("application/json".toMediaTypeOrNull()))
            .build()

        try {
            rawExecute<String>(request)
        } catch (e: Exception) {
            log.error("Falha ao notificar o usuário. Body: [{}]", requestBody, e)
        }
    }
}

data class PushNotificationRequest(val content: ContentRequest,
                                   @JsonProperty("source_entity") val sourceEntity: MetadataRequest,
                                   val recipient: MetadataRequest,
                                   val importance: String,
                                   val link: String)
data class ContentRequest(val message: String, val title: String)
data class MetadataRequest(val identifier: String, val type: String)