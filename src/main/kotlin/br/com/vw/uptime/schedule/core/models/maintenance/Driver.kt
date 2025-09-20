package br.com.vw.uptime.schedule.core.models.maintenance

import jakarta.validation.constraints.NotBlank

class Driver {

    @NotBlank
    var name: String = ""
    @NotBlank
    var cnh: String = ""
    @NotBlank
    var email: String = ""
    @NotBlank
    var phone: String = ""

}