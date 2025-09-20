package br.com.vw.uptime.schedule.entrypoint.requests

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.PositiveOrZero
import java.math.BigDecimal

class VehicleServiceRequest {

    @NotBlank
    lateinit var id:String
    @NotBlank
    lateinit var name:String
    @PositiveOrZero
    lateinit var price: BigDecimal

}