package br.com.vw.uptime.schedule.entrypoint.requests

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.LocalDateTime

class ScheduleRequest {
    @NotNull
    var scheduledDate: LocalDateTime = LocalDateTime.now()
}