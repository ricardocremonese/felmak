package br.com.vw.uptime.schedule.core.models.asset

import com.google.gson.annotations.SerializedName

class Asset {

    lateinit var id:String
    @SerializedName("account_id")
    lateinit var accountId: String
    lateinit var name: String
    lateinit var status: String
    lateinit var type: String
    var identification: String? = null
        get() {
            if(field == "0") {
                return null
            }
            return field
        }

    @SerializedName("identification_type")
    var identificationType: String? = null
    var brand: String? = null
    @SerializedName("license_plate")
    var licensePlate: String? = null
    @SerializedName("license_plate_country_code")
    var licensePlateCountryCode: String? = null
    @SerializedName("_embedded")
    var embedded: Embedded? = null
}

class Embedded {
    @SerializedName("master_data")
    var masterData: MasterData? = null
    lateinit var tags: Tags
}

class MasterData {
    @SerializedName("vehicle_model")
    var vehicleModel: String? = null
}

class Tags {
    var items: List<GroupFleetIdData> = listOf()
}

class GroupFleetIdData {
    lateinit var id: String
}