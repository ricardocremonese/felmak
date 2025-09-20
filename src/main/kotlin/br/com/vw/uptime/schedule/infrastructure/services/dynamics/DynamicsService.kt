package br.com.vw.uptime.schedule.infrastructure.services.dynamics

import br.com.vw.uptime.schedule.infrastructure.gateway.DynamicsGateway
import org.springframework.stereotype.Service

@Service
class DynamicsService(private val dynamicsGateway: DynamicsGateway) {
    fun acquireProtocol(): String {
        dynamicsGateway.sendCheckupSchedule().let {
            return dynamicsGateway.acquireProtocol(it)
        }
    }
}