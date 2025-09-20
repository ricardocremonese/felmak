package br.com.vw.uptime.schedule.infrastructure.gateway.response

/**
 * Representa o tempo médio, em segundos, apurado entre dt_start e dt_end
 * para uma etapa específica de ocorrência.
 *
 * @property step Nome da etapa (por exemplo: "Chamado", "Triagem", "Deslocamento").
 * @property averageSeconds Tempo médio em segundos.
 */
data class StepAverageTimeResponse(
    val step: String,
    val averageSeconds: Long
)
