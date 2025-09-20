package br.com.vw.uptime.schedule.core.models.drivers

import com.google.gson.annotations.SerializedName

class Driver(
    private val driverData: DriverData
) {

    fun getAccountId(): String {
        return driverData.accountId
    }
    fun getId(): String {
        return driverData.id
    }
    fun getFirstName(): String {
        return driverData.firstName
    }
    fun getLastName(): String {
        return driverData.lastName
    }
    fun getDisplayName(): String {
        return driverData.displayName
    }
    fun getEmail() : String {
        return driverData.email
    }
    fun getPhoneNumber():String {
        return driverData.phoneNumber
    }
    fun getStatus(): String {
        return driverData.status
    }

    fun getDriverLicence():String {
        return driverData.embedded.identifications.firstOrNull {
            it.identification == "rio-driver-identification"
        }?.identification ?: ""
    }
}