package br.com.vw.uptime.schedule.entrypoint.requests

import br.com.vw.uptime.schedule.core.enums.schedule.InviterType
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.LocalDateTime

class RescheduleRequest {

    @NotBlank
    lateinit var id:String

    @NotNull
    var rescheduleDate: LocalDateTime? = null

    @NotNull
    var rescheduledBy:InviterType? = null
    var consultantId:String? = null
    @NotBlank
    var dealershipId:String = ""

}