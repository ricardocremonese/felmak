package br.com.vw.uptime.schedule.entrypoint.requests.occurrence

import br.com.vw.uptime.schedule.core.enums.occurrence.FinalizationReasonType
import jakarta.validation.constraints.Size

data class FinalizeOccurrenceRequest(
    val finalizationReasonType: FinalizationReasonType? = null,
    
    @field:Size(max = 1000, message = "Descrição do motivo não pode exceder 1000 caracteres")
    val finalizationReasonDescription: String? = null
)
