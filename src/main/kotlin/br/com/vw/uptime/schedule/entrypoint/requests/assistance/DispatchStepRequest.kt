package br.com.vw.uptime.schedule.entrypoint.requests.assistance

import java.time.LocalDateTime

data class DispatchStepRequest(val name:String? = null,
                               val updateAt: LocalDateTime? = null,
                               val done: Boolean? = null,
                               val assignedTo: String? = null,
                               val indexAt: Int? = null)
