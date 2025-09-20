package br.com.vw.uptime.schedule.infrastructure.message.impl

import br.com.vw.uptime.schedule.core.enums.maintenance.DmlType
import br.com.vw.uptime.schedule.infrastructure.message.AbstractProducer
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.sqs.SqsAsyncClient

@Component
class OccurrenceMaintenanceManagerProducer(sqsAsyncClient: SqsAsyncClient,
                                           objectMapper: ObjectMapper) : AbstractProducer(sqsAsyncClient, objectMapper) {

    @Value("\${sqs.maintenance-occurrence}")
    lateinit var queueName: String

    companion object {
        private val log = LoggerFactory.getLogger(OccurrenceMaintenanceManagerProducer::class.java)
    }

    fun sendMessageToDeleteMaintenance(scheduleUuid: String) = sendMessage(scheduleUuid, DmlType.DELETE)

    fun sendMessageToCreateMaintenance(scheduleUuid: String) = sendMessage(scheduleUuid, DmlType.INSERT)

    private fun sendMessage(scheduleUuid: String, operation: DmlType) {
        log.info("Enviando mensagem para fila [{}]. Schedule uuid [{}], operation [{}]", queueName, scheduleUuid, operation)
        try {
            val body = toJson(mapOf("scheduleUuid" to scheduleUuid, "operation" to operation.name))
            sendMessage(body, this.queueName)
            log.info("Mensagem com body [{}] para fila [{}] enviada com sucesso.", body, queueName)
        } catch (ex: Exception) {
            log.error("Falha ao enviar a mensagem na fila [{}] para schedule uuid [{}] e operation [{}]", queueName, scheduleUuid, operation, ex)
        }
    }
}