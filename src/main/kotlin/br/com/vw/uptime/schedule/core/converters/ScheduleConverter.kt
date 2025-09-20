package br.com.vw.uptime.schedule.core.converters

import br.com.vw.uptime.schedule.core.models.schedule.input.Schedule
import br.com.vw.uptime.schedule.core.models.schedule.input.StateHistoryItem
import br.com.vw.uptime.schedule.entrypoint.responses.ScheduleResponse
import br.com.vw.uptime.schedule.entrypoint.responses.StateHistoryItemResponse
import br.com.vw.uptime.schedule.infrastructure.entities.checkup.ScheduleInCheckupEntity

class ScheduleConverter {

    companion object {
        fun scheduleToScheduleResponse(schedule: Schedule): ScheduleResponse {
            return Mapping.copy(schedule, mapScheduleResponseDeep(schedule))
        }

        private fun mapScheduleResponseDeep(schedule: Schedule): ScheduleResponse {
            return with(ScheduleResponse()) {
                stateHistory = schedule.stateHistory.map { Mapping.copy(it, StateHistoryItemResponse()) }
                this
            }
        }

        fun entityToSchedule(scheduleEntity: ScheduleInCheckupEntity) : Schedule {
            return Mapping.copy(
                scheduleEntity,
                with(Schedule()) {
                    stateHistory = scheduleEntity.stateHistory.map { Mapping.copy(it, StateHistoryItem()) }
                    //vehicleMaintenance = vehicleMaintenanceEntityToVehicleMaintenance(scheduleEntity.maintenance)
                    this
                }
            )
        }
    }
}