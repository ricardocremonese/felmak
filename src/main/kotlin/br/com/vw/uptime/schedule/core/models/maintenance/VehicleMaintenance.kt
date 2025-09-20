package br.com.vw.uptime.schedule.core.models.maintenance

class VehicleMaintenance {

    lateinit var vehicle: Vehicle
    lateinit var driver: Driver
    var generalObservations:String = ""
    lateinit var dealerShip: DealerShipSchedule
    var otherServices: List<VehicleService> = arrayListOf()
    var vehicleParts: List<VehiclePart> = arrayListOf()

}