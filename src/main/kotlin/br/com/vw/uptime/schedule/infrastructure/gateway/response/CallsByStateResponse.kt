
package br.com.vw.uptime.schedule.infrastructure.gateway.response

/**
 * DTO de resposta: número de chamados agregados por estado.
 *
 * @property state Sigla ou nome do estado.
 * @property count Quantidade de chamados naquele estado.
 */
data class CallsByStateResponse(
    val state: String,
    val count: Long
)
