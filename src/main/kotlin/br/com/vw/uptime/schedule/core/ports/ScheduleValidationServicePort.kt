package br.com.vw.uptime.schedule.core.ports

import br.com.vw.uptime.schedule.infrastructure.entities.schedule.ScheduleEntity
import java.time.LocalDateTime

interface ScheduleValidationServicePort {
    fun scheduleDateFromTodayValidation(scheduleDate: LocalDateTime)
    fun scheduleExistsValidation(id: String): ScheduleEntity
}