package br.com.vw.uptime.schedule.infrastructure.services.maintenance

import br.com.vw.uptime.schedule.core.models.maintenance.CheckupSchedule
import br.com.vw.uptime.schedule.core.models.assistance.AssistanceListItem
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.infrastructure.services.asset.AssetsServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.maintenance.MaintenanceTicketServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.checkup.CheckupScheduleServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.assistance.AssistanceService
import br.com.vw.uptime.schedule.infrastructure.repositories.assistance.AssistanceRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.CheckupScheduleRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.MaintenanceRepository
import br.com.vw.uptime.schedule.infrastructure.gateway.response.MaintenanceHistoryResponse
import br.com.vw.uptime.schedule.entrypoint.responses.MaintenanceTicketDetailResponse
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class MaintenanceHistoryServiceImpl(
    val assetsServiceImpl: AssetsServiceImpl,
    val assistanceService: AssistanceService,
    val checkupScheduleServiceImpl: CheckupScheduleServiceImpl,
    val maintenanceTicketServiceImpl: MaintenanceTicketServiceImpl,
    val assistanceRepository: AssistanceRepository,
    val checkupScheduleRepository: CheckupScheduleRepository,
    val maintenanceRepository: MaintenanceRepository,
) {

    fun getSchedulingsByIds(schedulingIds: List<String>): List<CheckupSchedule> {
        val schedulesEntity = checkupScheduleRepository.getCheckupSchedulesByIds(schedulingIds)
        if (schedulesEntity.isEmpty()) {
            return emptyList()
        }
        val schedules = checkupScheduleServiceImpl.getSchedulesEntityToResponse(schedulesEntity)
        return schedules
    }

    fun getFleetTickets(chassisList: List<String>, date: String? = "", sortDirection: String? = null): List<MaintenanceTicketDetailResponse> {
        val tickets = if (date != "") { 
            chassisList.chunked(50)
                .flatMap { chunk ->
                    maintenanceRepository.getAllByChassisList(chunk).map {
                        maintenanceTicketServiceImpl.ticketEntityToDetails(it)
                    }
                }
                .filter { ticket -> ticket.scheduleDate.toLocalDate().toString() == date }
            } else {
                chassisList.chunked(50)
                    .flatMap { chunk ->
                        maintenanceRepository.getAllByChassisList(chunk).map {
                            maintenanceTicketServiceImpl.ticketEntityToDetails(it)
                        }
                    }
            }
            .let { filteredTickets: List<MaintenanceTicketDetailResponse> ->
                if (sortDirection?.equals("desc", ignoreCase = true) == true) {
                    filteredTickets.sortedByDescending { ticket -> ticket.scheduleDate }
                } else {
                    filteredTickets.sortedBy { ticket -> ticket.scheduleDate }
                }
            }
        return tickets
    }

    fun getFleetAssistances(chassisList: List<String>, date: String? = "", sortDirection: String? = null): List<AssistanceListItem> {
        val assistances = if (date != "") { 
            chassisList.chunked(50)
                .flatMap { chunk ->
                    assistanceRepository.getAssistanceByChassisList(chunk).map {
                        assistanceService.mapAssistanceEntityToListItem(it)
                    }
                }
                .filter { assistance -> assistance.createAt.toLocalDate().toString() == date }
            } else {
                chassisList.chunked(50)
                    .flatMap { chunk ->
                        assistanceRepository.getAssistanceByChassisList(chunk).map {
                            assistanceService.mapAssistanceEntityToListItem(it)
                        }
                    }
            }
            .let { filteredAssistances: List<AssistanceListItem> ->
                if (sortDirection?.equals("desc", ignoreCase = true) == true) {
                    filteredAssistances.sortedByDescending { assistance -> assistance.createAt }
                } else {
                    filteredAssistances.sortedBy { assistance -> assistance.createAt }
                }
            }
        return assistances
    }

    fun getFleetMaintenanceHistory(
        page: Int,
        limit: Int,
        sortDirection: String?,
        queryChassis: String?,
        date: String?
    ): List<MaintenanceHistoryResponse> {
        val assets = assetsServiceImpl.getAssetsAll()
        val chassisList = assets.mapNotNull { it.getIdentification() }
            .filter { queryChassis == null || it.contains(queryChassis, ignoreCase = true) }
            .toList()

        val tickets = getFleetTickets(chassisList, date, sortDirection)
        val schedulings = getSchedulingsByIds(tickets.map { it.maintenanceScheduleId })
        val assistances = getFleetAssistances(chassisList, date, sortDirection)
        
        val allMaintenanceHistory = (tickets.map { ticket ->
            MaintenanceHistoryResponse(
                type = "TICKET",
                date = ticket.scheduleDate,
                ticket = ticket,
                scheduling = schedulings.find { it.id.toString() == ticket.maintenanceScheduleId }
            )
        } + assistances.map { assistance ->
            MaintenanceHistoryResponse(
                type = "ASSISTANCE",
                date = assistance.createAt,
                assistance = assistance
            )
        })
        .let { filteredHistory: List<MaintenanceHistoryResponse> ->
            if (sortDirection?.equals("desc", ignoreCase = true) == true) {
                filteredHistory.sortedByDescending { history -> history.date }
            } else {
                filteredHistory.sortedBy { history -> history.date }
            }
        }

        if (allMaintenanceHistory.isEmpty() || (page - 1) * limit >= allMaintenanceHistory.size) {
            return emptyList()
        }

        return allMaintenanceHistory.stream()
            .skip((page - 1) * limit.toLong())
            .limit(limit.toLong())
            .toList()
    }
}