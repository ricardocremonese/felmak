package br.com.vw.uptime.schedule.core.models.maintenance

import br.com.vw.uptime.schedule.infrastructure.services.checkup.Campaigns
import br.com.vw.uptime.schedule.infrastructure.services.checkup.PlanMaintenance
import br.com.vw.uptime.schedule.infrastructure.services.checkup.VehicleGeoLocation
import br.com.vw.uptime.schedule.infrastructure.services.checkup.VehicleTable

class VehicleInfo {

    lateinit var vehicle: VehicleTable
    var vehicleScore:Int = 0
    /**
     * Em Garantia, Expirada
     */
    lateinit var warrantyStatus:String

    /**
     * Premium, Basic, E-fleet or nothing
     */
    lateinit var vehiclePlan:List<PlanMaintenance>

    /**
     * Online or Offline
     */
    lateinit var status:String

    /**
     * NONE, IN_MAINTENANCE, FINISHED
     */
    lateinit var checkupStatus:String

    /**
     * Prev, Plus, Max or nothing
     */
    lateinit var volksTotal:String
    lateinit var campaigns: Campaigns

    var metricType: String? = null
    var lastVehicleCheckup: StampLast? = null
    var nextVehicleCheckup: NextCheckups? = null

    var previousCheckups: List<StampLast> = arrayListOf()
    var nextCheckups: List<NextCheckups> = arrayListOf()

    var geoLocation: VehicleGeoLocation? = null
}