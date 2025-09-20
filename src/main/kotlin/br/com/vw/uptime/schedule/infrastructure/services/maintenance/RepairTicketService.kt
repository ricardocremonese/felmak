package br.com.vw.uptime.schedule.infrastructure.services.maintenance

import br.com.vw.uptime.schedule.core.converters.Mapping
import br.com.vw.uptime.schedule.core.enums.maintenance.StepType
import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.requests.CheckoutRequest
import br.com.vw.uptime.schedule.entrypoint.requests.RepairRequest
import br.com.vw.uptime.schedule.entrypoint.responses.RepairResponse
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.MaintenanceTicketEntity
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.RepairEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.MaintenanceRepository
import okhttp3.internal.immutableListOf
import org.apache.commons.lang3.StringUtils
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import kotlin.reflect.full.memberProperties

@Service
class RepairTicketService(val maintenanceRepository: MaintenanceRepository, val ticketToScheduleService:TicketToScheduleService) {
    private val log = LoggerFactory.getLogger(RepairTicketService::class.java)

    fun createOrUpdateRepair(ticketId: String, repairRequest: RepairRequest) {
        log.info("Save repair: {} with id {}", repairRequest, ticketId)

        val repairEntity = Mapping.copy(repairRequest, RepairEntity())

        getTicketOrElseThrows(ticketId).let {
            log.info("Ticket found with id {}. Updating repair with {}",ticketId, repairEntity)
            it.repair = repairEntity
            it.status = StepType.REPAIR.name
            maintenanceRepository.save(it)

            ticketToScheduleService.updateMaintenanceOnSchedule(
                it.status,
                it.repair!!,
                it.maintenanceScheduleId
            )

            log.info("Ticket successfully updated repair data {} with id {}", repairEntity, ticketId)
        }
    }

    fun getTicketRepair(ticketId: String) : RepairResponse {
        log.info("Searching ticket screening with id {}", ticketId)

        getTicketOrElseThrows(ticketId).let { ticket ->
            log.info("Ticket {} found with id {}", ticket, ticketId)
            getRepairOrElseThrows(ticket).let { repair ->
                return Mapping.copy(repair, RepairResponse())
            }
        }
    }

    fun checkOut(ticketId:String, checkoutRequest: CheckoutRequest) {
        log.info("Validating checkout date for ticket repair with id {} - Date {} - Hour {}", ticketId,
            checkoutRequest.checkOutDate, checkoutRequest.checkOutHour)
        val ticket =  getTicketOrElseThrows(ticketId)

        val pendingMandatoryFields = getRepairOrElseThrows(ticket).let { screening ->
            RepairEntity::class.memberProperties
                .filter { !BYPASS_VALIDATION_FIELDS.contains(it.name) && it.getter.call(screening) == null }
                .map { it.name }
                .toList()
        }

        if (pendingMandatoryFields.isNotEmpty()) {
            val messageError = "Os campos [${StringUtils.join(pendingMandatoryFields, ",")}] são obrigatórios!"
            throw BusinessException(createErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY, messageError))
        }

        maintenanceRepository.save(ticket.apply {
            this.repair!!.checkOutDate = checkoutRequest.checkOutDate
            this.repair!!.checkOutHour = checkoutRequest.checkOutHour
        })

        ticketToScheduleService.updateMaintenanceOnSchedule(
            ticket.status,
            ticket.repair!!,
            ticket.maintenanceScheduleId
        )
    }

    private fun getTicketOrElseThrows(ticketId: String) : MaintenanceTicketEntity {
        return maintenanceRepository.findById(ticketId) ?: throw BusinessException(createErrorCodeResponse(HttpStatus.NOT_FOUND,
            "Não foi encontrado nenhum ticket com o id $ticketId"))
    }

    private fun getRepairOrElseThrows(ticket: MaintenanceTicketEntity) : RepairEntity {
        return ticket.repair ?: throw BusinessException(createErrorCodeResponse(HttpStatus.NOT_FOUND,
            "Reparo ainda não cadastrado para o ticket com id ${ticket.id}"))
    }

    private fun createErrorCodeResponse(httpStatus: HttpStatus, message: String): ErrorCodeResponse {
        return ErrorCodeResponse(httpStatus.value().toString(),message)
    }

    companion object {
        private val BYPASS_VALIDATION_FIELDS : List<String> = immutableListOf("report", "checkOutDate", "checkOutHour")
    }
}