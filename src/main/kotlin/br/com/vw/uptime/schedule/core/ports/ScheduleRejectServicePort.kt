package br.com.vw.uptime.schedule.core.ports

import br.com.vw.uptime.schedule.core.models.schedule.input.Schedule
import br.com.vw.uptime.schedule.entrypoint.requests.ScheduleRejectInput

interface ScheduleRejectServicePort {
    fun rejectSchedule(scheduleRejectInput: ScheduleRejectInput) : Schedule
}