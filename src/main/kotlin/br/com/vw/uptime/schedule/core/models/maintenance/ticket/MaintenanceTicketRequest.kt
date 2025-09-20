package br.com.vw.uptime.schedule.core.models.maintenance.ticket

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.LocalDate
import java.time.LocalTime

class MaintenanceTicketRequest {

    @NotBlank
    lateinit var maintenanceScheduleId:String
    @NotNull
    var checkInDate: LocalDate? = null
    @NotNull
    var checkInHour: LocalTime? = null

}