package br.com.vw.uptime.schedule.infrastructure.services.maintenance

import br.com.vw.uptime.schedule.core.converters.Mapping
import br.com.vw.uptime.schedule.core.enums.maintenance.StepType
import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.requests.CheckoutRequest
import br.com.vw.uptime.schedule.entrypoint.requests.ReleaseTicketRequest
import br.com.vw.uptime.schedule.entrypoint.responses.ReleaseTicketResponse
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.MaintenanceTicketEntity
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.ReleaseEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.MaintenanceRepository
import okhttp3.internal.immutableListOf
import org.apache.commons.lang3.StringUtils
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import kotlin.reflect.full.memberProperties

@Service
class ReleaseTicketService(
    val maintenanceRepository: MaintenanceRepository,
    val ticketToScheduleService: TicketToScheduleService
) {
    private val log = LoggerFactory.getLogger(ReleaseTicketService::class.java)

    fun createOrUpdateRelease(ticketId: String, releaseTicketRequest: ReleaseTicketRequest) {
        log.info("Save release: {} with id {}", releaseTicketRequest, ticketId)

        val releaseEntity = Mapping.copy(releaseTicketRequest, ReleaseEntity())
        getTicketOrElseThrows(ticketId).let { ticket ->
            log.info("Ticket found with : {}. Updating release with {}",ticketId, releaseEntity)
            ticket.status = StepType.RELEASE.name
            maintenanceRepository.save(ticket.apply {
                this.release = releaseEntity
            })

            ticketToScheduleService.updateMaintenanceOnSchedule(
                ticket.status,
                ticket.release!!,
                ticket.maintenanceScheduleId,
                releaseTicketRequest.serviceOrder
            )

            log.info("Ticket successfully updated release data {} with id {}", releaseEntity, ticketId)
        }
    }

    fun getReleaseById(ticketId: String) : ReleaseTicketResponse {
        log.info("Searching ticket release with id {}", ticketId)

        getTicketOrElseThrows(ticketId).let { ticket ->
            log.info("Ticket {} found with id {}", ticket, ticketId)

            getReleaseOrElseThrows(ticket).let { release ->
                return Mapping.copy(release, ReleaseTicketResponse())
            }

        }
    }

    fun checkOut(ticketId:String, checkoutRequest: CheckoutRequest) {
        log.info("Validating checkout release screening with id {} - Date {} - Hour {}", ticketId,
            checkoutRequest.checkOutDate, checkoutRequest.checkOutHour)

        val ticket =  getTicketOrElseThrows(ticketId)

        val pendingMandatoryFields = getReleaseOrElseThrows(ticket).let { release ->
            ReleaseEntity::class.memberProperties
                .filter { !BYPASS_VALIDATION_FIELDS.contains(it.name) && it.getter.call(release) == null }
                .map { it.name }
                .toList()
        }

        if (pendingMandatoryFields.isNotEmpty()) {
            val messageError = "Os campos [${StringUtils.join(pendingMandatoryFields, ",")}] são obrigatórios!"
            throw BusinessException(createErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY, messageError))
        }

        maintenanceRepository.save(ticket.apply {
            this.status = StepType.FINISHED.name
            this.release!!.checkOutDate = checkoutRequest.checkOutDate
            this.release!!.checkOutHour = checkoutRequest.checkOutHour
            this.updateStatusGroupAndStartDate()
        })

        ticketToScheduleService.updateMaintenanceOnSchedule(
            ticket.status,
            ticket.release!!,
            ticket.maintenanceScheduleId
        )
    }

    private fun getReleaseOrElseThrows(ticket: MaintenanceTicketEntity): ReleaseEntity {
        return ticket.release ?: throw BusinessException(createErrorCodeResponse(HttpStatus.NOT_FOUND,
            "Liberação ainda não cadastrada para o ticket com id ${ticket.id}"))
    }

    private fun getTicketOrElseThrows(ticketId: String) : MaintenanceTicketEntity {
        return maintenanceRepository.findById(ticketId) ?: throw BusinessException(createErrorCodeResponse(
            HttpStatus.NOT_FOUND, "Não foi encontrado nenhum ticket com o id $ticketId"))
    }

    private fun createErrorCodeResponse(httpStatus: HttpStatus, message: String): ErrorCodeResponse {
        return ErrorCodeResponse(httpStatus.value().toString(),message)
    }

    companion object {
        private val BYPASS_VALIDATION_FIELDS : List<String> = immutableListOf("report", "checkOutDate", "checkOutHour")
    }
}