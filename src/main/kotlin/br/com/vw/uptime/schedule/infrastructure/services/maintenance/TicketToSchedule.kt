package br.com.vw.uptime.schedule.infrastructure.services.maintenance

import br.com.vw.uptime.schedule.infrastructure.entities.checkup.CheckupScheduleEntity
import br.com.vw.uptime.schedule.infrastructure.entities.checkup.MaintenanceEntity
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.TicketStep
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.CheckupScheduleRepository
import org.springframework.stereotype.Service

@Service
class TicketToScheduleService(
    val checkupScheduleRepository: CheckupScheduleRepository
) {

    fun updateMaintenanceOnSchedule(
        step:String,
        ticketStep: TicketStep,
        maintenanceScheduleId:String,
        serviceOrder:String? = null
    ) {
        val checkupScheduleEntity = checkupScheduleRepository.getCheckupScheduleById(maintenanceScheduleId)
        checkupScheduleRepository.updateCheckupSchedule(
            updateMaintenanceEntityOnSchedule(step, ticketStep, checkupScheduleEntity!!, serviceOrder)
        )
    }

    fun updateMaintenanceOnSchedule(
        step:String,
        ticketStep: TicketStep,
        checkupScheduleEntity:CheckupScheduleEntity,
        serviceOrder:String? = null
    ) {
        checkupScheduleRepository.updateCheckupSchedule(
            updateMaintenanceEntityOnSchedule(step, ticketStep, checkupScheduleEntity!!, serviceOrder)
        )
    }

    fun updateMaintenanceEntityOnSchedule(
        step:String,
        ticketStep: TicketStep,
        checkupScheduleEntity:CheckupScheduleEntity,
        serviceOrder:String? = null,
    ): CheckupScheduleEntity {
        return checkupScheduleEntity.apply {
            vehicleSchedule.maintenance = MaintenanceEntity().apply {
                this.statusId = step
                this.checkInDate = ticketStep.checkInDate()
                this.checkoutDate  = ticketStep.checkOutDate()
                this.serviceOrder = serviceOrder
            }
        }
    }
}