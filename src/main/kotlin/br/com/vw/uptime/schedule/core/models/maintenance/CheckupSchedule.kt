package br.com.vw.uptime.schedule.core.models.maintenance

import br.com.vw.uptime.schedule.core.models.schedule.input.Schedule
import br.com.vw.uptime.schedule.infrastructure.services.fieldAction.Campaign
import br.com.vw.uptime.schedule.infrastructure.services.user.Consultant
import java.util.*

class CheckupSchedule {

    lateinit var id:UUID
    lateinit var protocol: String
    var scheduleNumber: String? = null
    lateinit var schedule:Schedule
    lateinit var vehicleSchedule: VehicleSchedule
    var checkup:Checkup? = null
    var campaigns:List<Campaign> = arrayListOf()
    lateinit var consultant:Consultant
    lateinit var createdBy: String
    var scheduledBy: String? = ""
    var waitFor:String? = ""
    var assetId:String? = null
}