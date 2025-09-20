
package br.com.vw.uptime.schedule.infrastructure.services.maintenance

import br.com.vw.uptime.schedule.infrastructure.gateway.response.StepAverageTimePivotResponse
import br.com.vw.uptime.schedule.infrastructure.gateway.response.StepAverageTimeResponse

interface StepTimeService {
    // formato “longo”: cada linha é { step, averageSeconds }
    fun getAverageTimePerStep(): List<StepAverageTimeResponse>

    // formato “pivot”: uma única linha com colunas para cada etapa
    fun getAverageTimePerStepPivot(): StepAverageTimePivotResponse
}
