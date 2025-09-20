package br.com.vw.uptime.schedule.infrastructure.services.maintenance

import br.com.vw.uptime.schedule.core.enums.checkups.CheckupTypeScheduleEnum
import br.com.vw.uptime.schedule.core.enums.schedule.InviterType
import br.com.vw.uptime.schedule.core.models.maintenance.CheckupSchedule
import br.com.vw.uptime.schedule.core.models.maintenance.VehicleServices
import br.com.vw.uptime.schedule.entrypoint.responses.MaintenanceScheduleSummary
import br.com.vw.uptime.schedule.entrypoint.responses.MaintenanceTicketSummaryResponse
import br.com.vw.uptime.schedule.entrypoint.responses.MaintenanceTicketSummaryVehicle
import br.com.vw.uptime.schedule.entrypoint.responses.Step
import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.MaintenanceRepository
import br.com.vw.uptime.schedule.infrastructure.services.checkup.CheckupScheduleServiceImpl
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.util.*
import kotlin.jvm.optionals.getOrNull

@Service
class TicketService(
    private val maintenanceRepository: MaintenanceRepository,
    private val checkupScheduleServiceImpl: CheckupScheduleServiceImpl) {

    private val log = LoggerFactory.getLogger(TicketService::class.java)
    private val vehicleServices = VehicleServices()

    fun getTicketsHistory(filterById: String, pageSize: Int, cursor: Optional<String>, type: Optional<CheckupTypeScheduleEnum>, filterByType: InviterType) : PaginatedTicketsResponse {

        val scheduleTypeUnwrapped = type.getOrNull()
        log.info("Listar de [{}] com ID [{}] - quantidade por página [{}] e filtro de tickets com tipos [{}]", filterByType, filterById, pageSize, scheduleTypeUnwrapped)

        val pairResponse = when(scheduleTypeUnwrapped) {
            CheckupTypeScheduleEnum.FIELD_CAMPAIGN -> maintenanceRepository.getFieldsCampaignSchedulesHistory(filterById, pageSize, cursor, filterByType)
            CheckupTypeScheduleEnum.PREVENTIVE ->  maintenanceRepository.getPreventiveSchedulesHistory(filterById, pageSize, cursor, filterByType)
            else -> maintenanceRepository.getAllSchedulesHistory(filterById, pageSize, cursor, filterByType)
        }

        val ticketsResponse = pairResponse.second.map { ticketItem ->
            val maintenanceSchedule = checkupScheduleServiceImpl.getScheduleById(ticketItem.maintenanceScheduleId)
            val amountTotal = vehicleServices.getTotal(maintenanceSchedule.vehicleSchedule.otherServices.services)
            MaintenanceTicketSummaryResponse(
                id = ticketItem.id,
                osNumber = ticketItem.screening?.serviceOrder,
                vehicle = MaintenanceTicketSummaryVehicle(name = maintenanceSchedule.vehicleSchedule.vehicle.name, chassis = maintenanceSchedule.vehicleSchedule.vehicle.chassis),
                maintenanceSchedule = MaintenanceScheduleSummary(amountTotal, maintenanceSchedule.protocol, maintenanceSchedule.schedule.createdDate, maintenanceSchedule.schedule.sourceUserName),
                createdAt = LocalDateTime.of(ticketItem.ticket.checkInDate, ticketItem.ticket.checkInHour),
                type = getTicketsType(maintenanceSchedule),
                ticket = calculateExecutionTime(ticketItem.ticket.checkInDate, ticketItem.ticket.checkInHour, ticketItem.ticket.checkOutDate, ticketItem.ticket.checkOutHour),
                screening = calculateExecutionTime(ticketItem.screening?.checkInDate, ticketItem.screening?.checkInHour, ticketItem.screening?.checkOutDate, ticketItem.screening?.checkOutHour),
                repair = calculateExecutionTime(ticketItem.repair?.checkInDate, ticketItem.repair?.checkInHour, ticketItem.repair?.checkOutDate, ticketItem.repair?.checkOutHour),
                inspection = calculateExecutionTime(ticketItem.inspection?.checkInDate, ticketItem.inspection?.checkInHour, ticketItem.inspection?.checkOutDate, ticketItem.inspection?.checkOutHour),
                release = calculateExecutionTime(ticketItem.release?.checkInDate, ticketItem.release?.checkInHour, ticketItem.release?.checkOutDate, ticketItem.release?.checkOutHour)
            )
        }.toList()
        return PaginatedTicketsResponse(tickets = ticketsResponse, cursor = pairResponse.first )
    }

    private fun calculateExecutionTime(checkInDate: LocalDate?, checkInHour: LocalTime?, checkOutDate: LocalDate?, checkOutHour: LocalTime?) : Step? {
        if (checkInDate == null || checkInHour == null || checkOutDate == null || checkOutHour == null){
            return null
        }
        val totalTimeExecution = Duration.between(LocalDateTime.of(checkInDate, checkInHour), LocalDateTime.of(checkOutDate, checkOutHour))

        return Step(String.format("%s:%sh", format(totalTimeExecution.toHours()), format(totalTimeExecution.toMinutes())))
    }

    private fun format(value: Long): String{
        return value.toString().padStart(2,'0')
    }

    private fun getTicketsType(schedule: CheckupSchedule): List<String> {
        val types = emptyList<String>().toMutableList()
        if (schedule.campaigns.isNotEmpty()) {
            types += CheckupTypeScheduleEnum.FIELD_CAMPAIGN.description
        }

        if (schedule.checkup != null) {
            types += CheckupTypeScheduleEnum.PREVENTIVE.description
        }

        return types
    }
}


data class PaginatedTicketsResponse (
    val tickets: List<MaintenanceTicketSummaryResponse>,
    val cursor: String? = null
)