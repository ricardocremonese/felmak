package br.com.vw.uptime.schedule.core.models.maintenance

import jakarta.validation.constraints.NotBlank

class VehiclePart {

    @NotBlank
    lateinit var id:String

    @NotBlank
    lateinit var name:String
}