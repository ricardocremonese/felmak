package br.com.vw.uptime.schedule.core.models.maintenance

import br.com.vw.uptime.schedule.infrastructure.services.checkup.PlanMaintenance
import java.time.LocalDateTime

class VehicleSchedule {

    lateinit var vehicle: Vehicle
    var driver: Driver? = null
    var generalObservations:String = ""
    var comments:String = ""
    lateinit var dealership: DealerShipSchedule
    lateinit var otherServices: VehicleServices
    var maintenance:Maintenance? = null
    var plans:List<PlanMaintenance> = arrayListOf()

}

class Maintenance {
    lateinit var statusId:String
    lateinit var checkInDate: LocalDateTime
    var checkoutDate:LocalDateTime? = null
    var serviceOrder:String? = null
}