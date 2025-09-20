package br.com.vw.uptime.schedule.core.models.alerts

import br.com.vw.uptime.schedule.infrastructure.repositories.alerts.DataData

class Data(private val data: DataData) {
    fun getId(): String {
        return data.id
    }
    fun getVehicleId(): String {
        return data.vehicleId
    }
    fun getVehicle(): String {
        return data.vehicle
    }
    fun getVin() : String {
        return data.vin
    }
    fun getDate() : String {
        return data.date
    }
    fun getDescription() : String {
        return data.description
    }
    fun getSpn(): String {
        return data.spn
    }
    fun getSpnDescription(): String {
        return data.spnDescription
    }
    fun getFmi() : String {
        return data.fmi
    }
    fun getFmiDescription() : String {
        return data.fmiDescription
    }
    fun getLampStatus() : String {
        return data.lampStatus
    }
    fun getLatitude() : Double {
        return data.latitude
    }
    fun getLongitude(): Double {
        return data.longitude
    }
    fun getSourceAddress() : String {
        return data.sourceAddress
    }
    fun getKm(): String {
        return data.km
    }


    fun getCategory() : String {
        if(containsBreak()) {
            return "brake"
        }
        return ""
    }

    private fun containsBreak() : Boolean {
        if(getSourceAddress().lowercase().contains("freio")) {
            return true
        }
        if(getSpnDescription().lowercase().contains("freio")) {
            return true
        }
        if(getFmiDescription().lowercase().contains("freio")) {
            return true
        }
        if(getDescription().lowercase().contains("freio")) {
            return true
        }
        return false
    }

    fun getTags(): List<Tag> {
        return data.tags.map {
            Tag(it)
        }
    }
}