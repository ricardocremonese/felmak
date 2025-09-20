package br.com.vw.uptime.schedule.entrypoint.responses

import br.com.vw.uptime.schedule.core.models.maintenance.Checkup
import br.com.vw.uptime.schedule.core.models.maintenance.Inspection
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.RateEntity
import br.com.vw.uptime.schedule.infrastructure.services.fieldAction.Campaign
import java.time.LocalDateTime

class MaintenanceTicketDetailResponse {

    lateinit var id: String
    lateinit var scheduleDate: LocalDateTime
    lateinit var maintenanceScheduleId: String
    lateinit var status: String
    lateinit var vehicle: VehicleTicketDetail
    var checkup: Checkup? = null
    var campaigns:List<Campaign> = listOf()

    lateinit var ticket: TicketResponse
    var inspection: Inspection? = null
    var rates: Map<String, RateEntity> = mutableMapOf()
    var screening: ScreeningResponse? = null
    var repair: RepairResponse? = null
    var release: ReleaseTicketResponse? = null
}

class VehicleTicketDetail (
    val identification: String?,
    val model:String?,
    val name:String?
)

class FieldCamp