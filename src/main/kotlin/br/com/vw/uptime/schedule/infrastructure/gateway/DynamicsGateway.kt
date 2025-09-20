package br.com.vw.uptime.schedule.infrastructure.gateway

import org.springframework.stereotype.Component
import java.util.*

@Component
class DynamicsGateway {
    fun sendCheckupSchedule() : String {
        return UUID.randomUUID().toString()
    }

    fun acquireProtocol(bookingId: String) : String {
        return "AGD ${Random().nextInt(999999)}"
    }
}