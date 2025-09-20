package br.com.vw.uptime.schedule.entrypoint.requests

import jakarta.validation.constraints.NotNull
import java.time.LocalDate
import java.time.LocalTime

class CheckoutRequest {
    @NotNull
    var checkOutDate:LocalDate? = null

    @NotNull
    var checkOutHour: LocalTime? = null
}