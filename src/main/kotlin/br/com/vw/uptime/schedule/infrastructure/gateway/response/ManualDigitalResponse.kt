package br.com.vw.uptime.schedule.infrastructure.gateway.response

data class ManualDigitalResponse(val draw: Int?,
                                 val recordsTotal: String?,
                                 val recordsFiltered:String?,
                                 val data:String?,
                                 val messageError: String?,
                                 val result: ResultResponse?)
