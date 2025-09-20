package br.com.vw.uptime.schedule.infrastructure.services.checkup

import br.com.vw.uptime.schedule.entrypoint.requests.CheckupScheduleProducerRequest
import br.com.vw.uptime.schedule.infrastructure.message.AbstractProducer
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.services.sqs.SqsAsyncClient


@Service
class CheckupScheduleSenderService(
    sqsAsyncClient: SqsAsyncClient,
    objectMapper: ObjectMapper) : AbstractProducer(sqsAsyncClient, objectMapper) {

    @Value("$\\{sqs-schedules.name}")
    lateinit var sqlSchedulesQueueName: String

    fun send(checkupScheduleProducerRequest: CheckupScheduleProducerRequest)  = sendMessage(toJson(checkupScheduleProducerRequest), this.sqlSchedulesQueueName)
}