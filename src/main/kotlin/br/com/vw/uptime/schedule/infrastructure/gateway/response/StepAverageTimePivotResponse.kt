package br.com.vw.uptime.schedule.infrastructure.gateway.response

/**
 * Representa, em formato “wide”, os tempos médios em segundos
 * de todas as etapas de ocorrência em uma única linha.
 *
 * @property Chamado Tempo médio da etapa “Chamado”, em segundos.
 * @property Triagem Tempo médio da etapa “Triagem”, em segundos.
 * @property Deslocamento Tempo médio da etapa “Deslocamento”, em segundos.
 * @property `2ª Diagnose` Tempo médio da etapa “2ª Diagnose”, em segundos.
 * @property Remoção Tempo médio da etapa “Remoção”, em segundos.
 * @property `3ª Diagnose` Tempo médio da etapa “3ª Diagnose”, em segundos.
 * @property `4ª Diagnose` Tempo médio da etapa “4ª Diagnose”, em segundos.
 * @property `Análise Garantia` Tempo médio da etapa “Análise Garantia”, em segundos.
 * @property `Ok do Cliente` Tempo médio da etapa “Ok do Cliente”, em segundos.
 * @property Peças Tempo médio da etapa “Peças”, em segundos.
 * @property `Peças em trânsito` Tempo médio da etapa “Peças em trânsito”, em segundos.
 */
data class StepAverageTimePivotResponse(
    val Chamado: Long,
    val Triagem: Long,
    val Deslocamento: Long,
    val `2ª Diagnose`: Long,
    val Remoção: Long,
    val `3ª Diagnose`: Long,
    val `4ª Diagnose`: Long,
    val `Análise Garantia`: Long,
    val `Ok do Cliente`: Long,
    val Peças: Long,
    val `Peças em trânsito`: Long
)
