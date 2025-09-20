package br.com.vw.uptime.schedule.core.converters

import br.com.vw.uptime.schedule.core.models.maintenance.*
import br.com.vw.uptime.schedule.core.models.schedule.input.Schedule
import br.com.vw.uptime.schedule.entrypoint.requests.VehicleScheduleRequest
import br.com.vw.uptime.schedule.infrastructure.entities.checkup.*
import br.com.vw.uptime.schedule.infrastructure.entities.schedule.ScheduleEntity
import br.com.vw.uptime.schedule.infrastructure.entities.schedule.StateHistoryItemEntity
import br.com.vw.uptime.schedule.infrastructure.services.fieldAction.Campaign

class CheckupScheduleConverter {

    companion object {

        fun checkupScheduleEntityToModel(checkupScheduleEntity:CheckupScheduleEntity) : CheckupSchedule {
            return with(CheckupSchedule()) {
                this.id = checkupScheduleEntity.id
                this.protocol = checkupScheduleEntity.protocol ?: ""
                this.scheduleNumber = checkupScheduleEntity.scheduleNumber
                this.schedule = ScheduleConverter.entityToSchedule(checkupScheduleEntity.schedule)
                this.vehicleSchedule = vehicleScheduleEntityToVehicleSchedule(checkupScheduleEntity.vehicleSchedule).apply {
                    this.vehicle.chassis = checkupScheduleEntity.chassis
                }
                this.consultant = ConsultantConverter.consultantEntityToConsultant(checkupScheduleEntity.consultant)
                this.campaigns = checkupScheduleEntity.campaigns.map {
                    Mapping.copy(it, Campaign())
                }
                this.createdBy = checkupScheduleEntity.createdBy ?:""
                this.scheduledBy = checkupScheduleEntity.scheduledBy ?:""
                this.waitFor = checkupScheduleEntity.waitFor
                this.assetId = checkupScheduleEntity.assetId
                this.checkup = checkupScheduleEntity.checkup?.let {
                    Checkup().apply {
                        this.range = CheckupRange().apply {
                            this.start = it.value
                        }
                        this.maintenanceGroupId = it.maintenanceGroupId
                    }
                }
                this
            }
        }

        private fun vehicleScheduleEntityToVehicleSchedule(vehicleScheduleEntity: VehicleScheduleEntity): VehicleSchedule {
            return with(VehicleSchedule()) {
                Mapping.copy(vehicleScheduleEntity, this)
                this.driver = vehicleScheduleEntity.driver?.let {
                    Mapping.copy(it, Driver())
                }
                this.vehicle = Mapping.copy(vehicleScheduleEntity.vehicle, Vehicle())
                this.dealership = Mapping.copy(vehicleScheduleEntity.dealership, DealerShipSchedule())
                this.otherServices = with(VehicleServices()) {
                    services = vehicleScheduleEntity.otherServices.map { Mapping.copy(it, VehicleService()) }
                    this
                }
                this.maintenance = vehicleScheduleEntity.maintenance?.let {
                    Mapping.copy(it, Maintenance())
                }
                this
            }
        }

        fun vehicleScheduleRequestToEntity(vehicleScheduleRequest: VehicleScheduleRequest) : VehicleScheduleEntity {
            return with(VehicleScheduleEntity()) {
                Mapping.copy(vehicleScheduleRequest, this)
                this.vehicle = Mapping.copy(vehicleScheduleRequest.vehicle, VehicleEntity())
                this.driver = vehicleScheduleRequest.driver?.let {
                    Mapping.copy(it, DriverEntity())
                }
                this.otherServices = vehicleScheduleRequest.otherServices.map { Mapping.copy(it, VehicleServiceEntity()) }
                this
            }
        }

        fun scheduleToScheduleEntity(schedule: Schedule) : ScheduleEntity {
            return with(ScheduleEntity()) {
                Mapping.copy(schedule, this)
                stateHistory = schedule.stateHistory.map { Mapping.copy(it, StateHistoryItemEntity()) }
                this
            }
        }

        fun scheduleToScheduleEntityForCheckupSchedule(schedule: Schedule, consultantId:String? = null) : ScheduleInCheckupEntity {
            return with(ScheduleInCheckupEntity()) {
                Mapping.copy(schedule, this)
                stateHistory = schedule.stateHistory.map {
                    Mapping.copy(
                        it,
                        with(StateHistoryItemCheckupEntity()) {
                            this.consultantId = consultantId
                            this
                        }
                    )
                }
                this
            }
        }

        fun fieldCampaignChildToFieldCampaign(fieldCampaignChild: CampaignScheduleChild) : Campaign {
            return Mapping.copy(fieldCampaignChild, Campaign())
        }
    }
}