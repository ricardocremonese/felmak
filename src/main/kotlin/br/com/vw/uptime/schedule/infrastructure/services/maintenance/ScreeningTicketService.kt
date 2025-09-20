package br.com.vw.uptime.schedule.infrastructure.services.maintenance

import br.com.vw.uptime.schedule.core.converters.Mapping
import br.com.vw.uptime.schedule.core.enums.maintenance.StepType
import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.requests.CheckoutRequest
import br.com.vw.uptime.schedule.entrypoint.requests.ScreeningRequest
import br.com.vw.uptime.schedule.entrypoint.responses.ScreeningResponse
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.MaintenanceTicketEntity
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.ScreeningEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.MaintenanceRepository
import okhttp3.internal.immutableListOf
import org.apache.commons.lang3.StringUtils
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import kotlin.reflect.full.memberProperties

@Service
class ScreeningTicketService(val maintenanceRepository: MaintenanceRepository, val ticketToScheduleService: TicketToScheduleService) {

    private val log = LoggerFactory.getLogger(ScreeningTicketService::class.java)

    fun createOrUpdateScreening(ticketId: String, screeningRequest: ScreeningRequest) {
        log.info("Save screening: {} with id {}", screeningRequest, ticketId)

        val screeningEntity = Mapping.copy(screeningRequest, ScreeningEntity())
        getTicketOrElseThrows(ticketId).let {
            log.info("Ticket found with : {}. Updating screening with {}",ticketId, screeningEntity)

            it.screening = screeningEntity
            it.status = StepType.SCREENING.name
            maintenanceRepository.save(it)

            ticketToScheduleService.updateMaintenanceOnSchedule(
                it.status,
                it.screening!!,
                it.maintenanceScheduleId,
                screeningRequest.serviceOrder
            )

            log.info("Ticket successfully updated screening data {} with id {}", screeningEntity, ticketId)
        }
    }

    fun getScreeningById(ticketId: String) : ScreeningResponse {
        log.info("Searching ticket screening with id {}", ticketId)

        getTicketOrElseThrows(ticketId).let { ticket ->
            log.info("Ticket {} found with id {}", ticket, ticketId)

            getScreeningOrElseThrows(ticket).let { screening ->
                return Mapping.copy(screening, ScreeningResponse())
            }

        }
    }

    fun checkOut(ticketId:String, checkoutRequest: CheckoutRequest) {
        log.info("Validating checkout ticket screening with id {} - Date {} - Hour {}", ticketId,
            checkoutRequest.checkOutDate, checkoutRequest.checkOutHour)

        val ticket =  getTicketOrElseThrows(ticketId)

        val pendingMandatoryFields = getScreeningOrElseThrows(ticket).let { screening ->
            ScreeningEntity::class.memberProperties
                .filter { !BYPASS_VALIDATION_FIELDS.contains(it.name) && it.getter.call(screening) == null }
                .map { it.name }
                .toList()
        }

        if (pendingMandatoryFields.isNotEmpty()) {
            val messageError = "Os campos [${StringUtils.join(pendingMandatoryFields, ",")}] são obrigatórios!"
            throw BusinessException(createErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY, messageError))
        }

        maintenanceRepository.save(ticket.apply {
            this.screening!!.checkOutDate = checkoutRequest.checkOutDate
            this.screening!!.checkOutHour = checkoutRequest.checkOutHour
        })

        ticketToScheduleService.updateMaintenanceOnSchedule(
            ticket.status,
            ticket.screening!!,
            ticket.maintenanceScheduleId
        )
    }

    private fun getTicketOrElseThrows(ticketId: String) : MaintenanceTicketEntity {
        return maintenanceRepository.findById(ticketId) ?: throw BusinessException(createErrorCodeResponse(HttpStatus.NOT_FOUND,
            "Não foi encontrado nenhum ticket com o id $ticketId"))
    }

    private fun getScreeningOrElseThrows(ticket: MaintenanceTicketEntity) : ScreeningEntity {
        return ticket.screening ?: throw BusinessException(createErrorCodeResponse(HttpStatus.NOT_FOUND,
            "Triagem ainda não cadastrada para o ticket com id ${ticket.id}"))
    }

    private fun createErrorCodeResponse(httpStatus: HttpStatus, message: String): ErrorCodeResponse {
        return ErrorCodeResponse(httpStatus.value().toString(),message)
    }

    companion object {
        private val BYPASS_VALIDATION_FIELDS : List<String> = immutableListOf("report", "checkOutDate", "checkOutHour")
    }
}