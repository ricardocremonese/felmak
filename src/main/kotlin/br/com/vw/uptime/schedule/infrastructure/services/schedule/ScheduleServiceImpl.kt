package br.com.vw.uptime.schedule.infrastructure.services.schedule

import br.com.vw.uptime.schedule.core.models.schedule.input.RescheduleInput
import br.com.vw.uptime.schedule.core.models.schedule.input.Schedule
import br.com.vw.uptime.schedule.infrastructure.repositories.schedule.ScheduleRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime


@Service
class ScheduleServiceImpl(
    val scheduleRepository: ScheduleRepository
) {

    fun createSchedule(scheduleInput:ScheduleInput) : Schedule {
        val schedule = scheduleRepository.createSchedule(
            scheduleInput
        )
        return schedule
    }

    fun rejectSchedule(checkupScheduleId:String) : Schedule {
        return scheduleRepository.rejectSchedule(checkupScheduleId)
    }

    fun reschedule(rescheduleInput: RescheduleInput): Schedule {
        return scheduleRepository.reschedule(rescheduleInput)
    }

    fun acceptSchedule(checkupScheduleId: String): Schedule {
        return scheduleRepository.acceptSchedule(checkupScheduleId)
    }

}

class ScheduleInput {
    var booking: String = ""
    lateinit var scheduledDate: LocalDateTime
    var sourceAccountId: String = ""
    var sourceUserId: String = ""
    var destinationAccountId: String = ""
    var destinationUserId: String = ""
}