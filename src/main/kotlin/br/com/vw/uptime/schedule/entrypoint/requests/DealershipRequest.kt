package br.com.vw.uptime.schedule.entrypoint.requests

import jakarta.validation.constraints.NotBlank

class DealershipRequest {

    @NotBlank
    lateinit var id: String
    var favorite: Boolean = false
}