package br.com.vw.uptime.schedule.infrastructure.message

import br.com.vw.uptime.schedule.core.utils.exceptions.UptimeException
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import software.amazon.awssdk.services.sqs.SqsAsyncClient
import software.amazon.awssdk.services.sqs.model.SendMessageRequest
import java.io.IOException


abstract class AbstractProducer(private val sqsAsyncClient: SqsAsyncClient,
                                private val objectMapper: ObjectMapper,) {
    companion object {
        private val log = LoggerFactory.getLogger(AbstractProducer::class.java)
    }

    protected fun sendMessage(body: String, queueUrl: String) = sqsAsyncClient.sendMessage(buildSendMessageRequest(body, queueUrl))

    protected fun toJson(content: Any): String {
        try {
            return objectMapper.writeValueAsString(content)
        } catch (ex: IOException) {
            log.error("Error no parse do Json do object [{}] com conteudo", content, ex)
            throw UptimeException("Erro em parsear objeto para json")
        }
    }

    private fun buildSendMessageRequest(messageBody: String, queueUrl: String) : SendMessageRequest =
        SendMessageRequest.builder()
            .queueUrl(queueUrl)
            .messageBody(messageBody)
            .build()
}