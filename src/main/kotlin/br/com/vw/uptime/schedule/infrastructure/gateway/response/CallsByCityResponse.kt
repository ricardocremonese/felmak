package br.com.vw.uptime.schedule.infrastructure.gateway.response

/**
 * DTO de resposta: número de chamados agregados por cidade.
 *
 * @property city Nome da cidade.
 * @property count Quantidade de chamados naquela cidade.
 */
data class CallsByCityResponse(
    val city: String,
    val count: Long
)
