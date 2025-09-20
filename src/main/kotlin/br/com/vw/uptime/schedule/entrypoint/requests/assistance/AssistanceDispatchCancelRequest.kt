package br.com.vw.uptime.schedule.entrypoint.requests.assistance

import jakarta.validation.constraints.NotBlank

class AssistanceDispatchCancelRequest {

    @NotBlank
    var reason:String? = null

    @NotBlank
    var justification:String? = null
}