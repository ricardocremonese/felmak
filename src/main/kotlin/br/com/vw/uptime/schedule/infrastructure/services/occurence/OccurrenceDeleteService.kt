package br.com.vw.uptime.schedule.infrastructure.services.occurence

import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.OccurrenceRepository
import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class OccurrenceDeleteService(
    private val occurrenceRepository: OccurrenceRepository
) {
    @Transactional
    fun deleteByUuid(occurrenceUuid: String) {
        val occurrence = occurrenceRepository.getOccurrenceByUuid(occurrenceUuid)
            ?: throw BusinessException(
                ErrorCodeResponse(HttpStatus.NOT_FOUND.value().toString(), "Ocorrência não encontrada")
            )
        occurrenceRepository.delete(occurrence)
    }
} 