package br.com.vw.uptime.schedule.infrastructure.services.maintenance

import br.com.vw.uptime.schedule.core.enums.maintenance.StepType
import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.requests.RatingRequest
import br.com.vw.uptime.schedule.entrypoint.responses.RatingResponse
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.RateEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.MaintenanceRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service

@Service
class RatingTicketService(val maintenanceRepository: MaintenanceRepository) {
    @Value("\${maintenance.rate.description.limit.size}")
    private var maxSizeRateDescription : Int = 200

    private val log = LoggerFactory.getLogger(RatingTicketService::class.java)

    fun rateService(ticketId: String, rateRequest: RatingRequest) {
        log.info("Save rating: {} with id {}", rateRequest, ticketId)

        validateRatingRequest(rateRequest)
        log.info("Validation finished : {} ", rateRequest)

        val rateEntity = RateEntity().apply {
            this.rate = rateRequest.rating ?: 0
            this.description = rateRequest.description
        }

        maintenanceRepository.findById(ticketId)?.let {
            log.info("Ticket found with : {}. Updating rating with {}",ticketId, rateEntity)

            if(StepType.RELEASE == rateRequest.step) {
                it.hasReview = true
            }

            it.rates += rateRequest.step.name to rateEntity
            maintenanceRepository.save(it)

            log.info("Ticket successfully updated rating data {} with id {}", rateEntity, ticketId)
        } ?: throw BusinessException(
            ErrorCodeResponse(
                HttpStatus.NOT_FOUND.value().toString(),
            "Não foi encontrado nenhum ticket com o id $ticketId")
        )
    }

    private fun validateRatingRequest(rateRequest: RatingRequest) {
        log.info("Validating rating : {} ", rateRequest)

        val allowedRangeNote = 0..10
        if (rateRequest.rating == null || !allowedRangeNote.contains(rateRequest.rating)) {
            throw BusinessException(ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(),
                "A nota deve estar entra 0 e 10",))
        }

        rateRequest.description?.let {
            if (it.length > maxSizeRateDescription) {
                throw BusinessException(ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(),
                    "A descrição não pode exceder $maxSizeRateDescription caracteres"))
            }
        }
    }

    fun getRating(ticketId: String, step: StepType): RatingResponse {
        log.info("Search rating by with id {}", ticketId)

        return maintenanceRepository.findById(ticketId)?.let {
            it.rates[step.name]?.let { rate ->
                return RatingResponse(step = step,
                        rating = rate.rate,
                        description = rate.description)
            } ?: RatingResponse(step = step, 0, "")
        } ?: throw BusinessException(
            ErrorCodeResponse(HttpStatus.NOT_FOUND.value().toString(),
                "Não foi encontrado nenhum ticket com o id $ticketId")
        )
    }
}