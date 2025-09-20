package br.com.vw.uptime.schedule.core.models.assistance

import java.time.LocalDateTime

class AssistanceListItem {
    var occurType: String? = null
    lateinit var id:String
    lateinit var chassis:String
    lateinit var vehicle:AssistanceVehicleItem
    var dispatch:DispatchItem? = null
    var driver:DriverItem? = null
    lateinit var createAt:LocalDateTime
    var state:String? = null
    var finishedAt: LocalDateTime? = null
}

class AssistanceVehicleItem {
    var model:String? = null
    var plate:String? = null
}

class VehicleLocationItem {
    var street:String? = null
    var neighbourhood:String? = null
    var city:String? = null
    var state:String? = null
    var longitude: Double? = null
    var latitude: Double? = null
}

class DispatchItem {
    lateinit var vehicleLocation:VehicleLocationItem
    lateinit var dealership:DealershipItem
}

class DealershipItem {
    lateinit var fantasyName:String
}

class DriverItem {
    lateinit var name:String
}