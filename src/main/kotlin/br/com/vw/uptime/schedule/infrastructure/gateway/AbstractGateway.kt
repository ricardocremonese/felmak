package br.com.vw.uptime.schedule.infrastructure.gateway

import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import okhttp3.OkHttpClient
import okhttp3.Request
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus

abstract class AbstractGateway(protected val okHttpClient: OkHttpClient, protected val objectMapper: ObjectMapper) {
    companion object {
        val log: Logger = LoggerFactory.getLogger(RioGateway::class.java)
    }

    protected inline fun <reified T: Any> rawExecute(request: Request): T {


        okHttpClient.newCall(request).execute().use {
            if (it.isSuccessful) {
                return objectMapper.readValue<T>(it.body!!.string())
            }
            log.error("Falhar ao executar o request HTTP. Response code [{}], Mensagem [{}]", it.code, it.message)
            throw BusinessException(
                ErrorCodeResponse(
                    it.code.toString(),
                    formatMessage(it.code, it.message),
                )
            )
        }
    }

    protected fun formatMessage(httpStatusCode: Int, defaultMessage: String): String {
        if (httpStatusCode == HttpStatus.TOO_MANY_REQUESTS.value()) {
            return "Too Many Attempts."
        }
        return defaultMessage
    }

    protected inline fun <reified T> ObjectMapper.readValue(body: String): T = readValue(body, object : TypeReference<T>()
    {})
}