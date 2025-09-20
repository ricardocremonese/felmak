package br.com.vw.uptime.schedule.infrastructure.services.maintenance

import br.com.vw.uptime.schedule.core.converters.Mapping
import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.enums.maintenance.StepType
import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.models.maintenance.Inspection
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.requests.CheckoutRequest
import br.com.vw.uptime.schedule.entrypoint.requests.InspectionRequest
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.InspectionEntity
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.MaintenanceTicketEntity
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.RepairEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.MaintenanceRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class InspectionTicketService(
    val maintenanceRepository:MaintenanceRepository,
    val ticketToScheduleService:TicketToScheduleService
) {
    fun createOrUpdateInspection(ticketId:String, inspectionRequest: InspectionRequest) {
        val maintenanceTicketEntity = getOrThrowIfTicketNotExists(ticketId)
        validateTicketToStatusInspection(maintenanceTicketEntity, inspectionRequest)
        updateNewEntity(maintenanceTicketEntity, inspectionRequest)
        ticketToScheduleService.updateMaintenanceOnSchedule(
            maintenanceTicketEntity.status,
            maintenanceTicketEntity.inspection!!,
            maintenanceTicketEntity.maintenanceScheduleId
        )
    }

    fun checkOutInspection(ticketId:String, checkoutRequest: CheckoutRequest) {
        val maintenanceTicketEntity = getOrThrowIfTicketNotExists(ticketId)
        validateCheckoutInspection(maintenanceTicketEntity)
        maintenanceRepository.save(maintenanceTicketEntity.apply {
            this.inspection!!.checkOutDate = checkoutRequest.checkOutDate
            this.inspection!!.checkOutHour = checkoutRequest.checkOutHour
        })
        ticketToScheduleService.updateMaintenanceOnSchedule(
            maintenanceTicketEntity.status,
            maintenanceTicketEntity.inspection!!,
            maintenanceTicketEntity.maintenanceScheduleId
        )
    }

    fun getInspection(ticketId: String) : Inspection {
        val maintenanceTicketEntity = getOrThrowIfTicketNotExists(ticketId)
        val inspection = maintenanceTicketEntity.inspection
        if(inspection == null) {
            throw BusinessException(
                ErrorCode.ENTITY_NOT_FOUND.toResponse()
            )
        }
        return Mapping.copy(inspection, Inspection())
    }

    private fun validateCheckoutInspection(maintenanceTicketEntity: MaintenanceTicketEntity) {
        val inspection = maintenanceTicketEntity.inspection
        if(inspection == null) {
            throw BusinessException(
                errorResponseInvalidState("Inspeção não realizada")
            )
        }
        if(inspection.checkInDate == null || inspection.checkInHour == null) {
            throw BusinessException(
                errorResponseInvalidState("Inspeção sem data de checkIn ou hora de checkIn")
            )
        }
    }

    private fun errorResponseInvalidState(message:String): ErrorCodeResponse {
        val errorCode = ErrorCode.TICKET_INVALID_STATE_TO_CHANGE
        return ErrorCodeResponse(
            errorCode.code,
            errorCode.message + ". $message"
        )
    }

    private fun getOrThrowIfTicketNotExists(ticketId: String): MaintenanceTicketEntity {
        val maintenanceTicketEntity = maintenanceRepository.findById(ticketId)
        if(maintenanceTicketEntity == null) {
            throw BusinessException(
                ErrorCode.TICKET_NOT_FOUND.toResponse()
            )
        }
        return maintenanceTicketEntity
    }

    private fun updateNewEntity(maintenanceTicketEntity: MaintenanceTicketEntity, inspectionRequest: InspectionRequest) {
        val inspection = InspectionEntity().apply {
            inspectionDate = LocalDateTime.now()
        }
        Mapping.copy(inspectionRequest, inspection)
        maintenanceTicketEntity.inspection = inspection
        maintenanceTicketEntity.status = StepType.INSPECTION.name
        maintenanceRepository.save(maintenanceTicketEntity)
    }

    private fun validateTicketToStatusInspection(maintenanceTicketEntity: MaintenanceTicketEntity, inspectionRequest: InspectionRequest) {
        val repair = maintenanceTicketEntity.repair
        if(repair == null) {
            val errorCode = ErrorCode.TICKET_INVALID_STATE_TO_CHANGE
            throw BusinessException(
                ErrorCodeResponse(
                    errorCode.code,
                    errorCode.message + ". Reparo deve ser realizado"
                )
            )
        }
        if(repair.checkOutDate == null || repair.checkOutHour == null) {
            val errorCode = ErrorCode.TICKET_INVALID_STATE_TO_CHANGE
            throw BusinessException(
                ErrorCodeResponse(
                    errorCode.code,
                    errorCode.message + ". Reparo checkoutDate e checkoutHour deve ser inserido"
                )
            )
        }
        checkInRepairDateValidation(inspectionRequest, repair)
    }

    private fun checkInRepairDateValidation(inspectionRequest: InspectionRequest, repair: RepairEntity) {
        if(inspectionRequest.checkInDate == null || inspectionRequest.checkInHour == null) {
            return
        }
        val checkInDateTime = LocalDateTime.of(inspectionRequest.checkInDate, inspectionRequest.checkInHour)
        val checkInDateTimeRepair = LocalDateTime.of(repair.checkOutDate, repair.checkOutHour)
        if(checkInDateTime.isBefore(checkInDateTimeRepair)) {
            val errorCode = ErrorCode.TICKET_INVALID_STATE_TO_CHANGE
            throw BusinessException(
                ErrorCodeResponse(
                    errorCode.code,
                    errorCode.message + ". Data do checkout do reparo não foi preenchida"
                )
            )
        }
    }
}