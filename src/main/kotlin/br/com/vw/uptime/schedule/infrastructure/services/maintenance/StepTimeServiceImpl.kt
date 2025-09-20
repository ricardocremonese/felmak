

package br.com.vw.uptime.schedule.infrastructure.services.maintenance

import br.com.vw.uptime.schedule.infrastructure.gateway.response.StepAverageTimePivotResponse
import br.com.vw.uptime.schedule.infrastructure.gateway.response.StepAverageTimeResponse
import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.OccurrenceStepRepository
import org.springframework.stereotype.Service

@Service
class StepTimeServiceImpl(
    private val occurrenceStepRepository: OccurrenceStepRepository
) : StepTimeService {

    /**
     * Retorna a lista de pares (etapa, tempo médio em segundos).
     */
    override fun getAverageTimePerStep(): List<StepAverageTimeResponse> {
        val rawResults: List<Array<Any>> = occurrenceStepRepository.findAverageTimePerStepRaw()
        return rawResults.map { row ->
            val stepName: String = row[0] as String
            val averageSeconds: Long = (row[1] as Number).toLong()
            StepAverageTimeResponse(
                step = stepName,
                averageSeconds = averageSeconds
            )
        }
    }

    /**
     * Retorna uma única linha com colunas nomeadas para cada etapa, no formato pivot.
     */
    override fun getAverageTimePerStepPivot(): StepAverageTimePivotResponse {
        val row: Array<Any> = occurrenceStepRepository.findAverageTimePerStepPivot()
        return StepAverageTimePivotResponse(
            Chamado = (row[1] as Number).toLong(),
            Triagem = (row[2] as Number).toLong(),
            Deslocamento = (row[3] as Number).toLong(),
            `2ª Diagnose` = (row[4] as Number).toLong(),
            Remoção = (row[5] as Number).toLong(),
            `3ª Diagnose` = (row[6] as Number).toLong(),
            `4ª Diagnose` = (row[7] as Number).toLong(),
            `Análise Garantia` = (row[8] as Number).toLong(),
            `Ok do Cliente` = (row[9] as Number).toLong(),
            Peças = (row[10] as Number).toLong(),
            `Peças em trânsito` = (row[11] as Number).toLong()
        )
    }
}
