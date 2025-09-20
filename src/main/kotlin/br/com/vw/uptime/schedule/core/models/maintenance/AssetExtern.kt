package br.com.vw.uptime.schedule.core.models.maintenance

import com.google.gson.annotations.SerializedName

data class AssetExtern(
    val id: String,
    @SerializedName("account_id")
    val accountId: String,
    val name: String,
    val status: String,
    val type: String,
    val identification: String?,
    @SerializedName("identification_type")
    val identificationType: String,
    val brand: String?,
    @SerializedName("license_plate")
    val licensePlate: String?,
    @SerializedName("license_plate_country_code")
    val licensePlateCountryCode: String?,
    @SerializedName("_embedded")
    val embedded: Embedded?,
)

data class Embedded(
    @SerializedName("master_data")
    val masterData: MasterData?,
    val tags: Tags,
)

data class MasterData(
    @SerializedName("vehicle_model")
    val vehicleModel:String?
)

data class Tags(
    val items: List<GroupFleetIdData>,
)

data class GroupFleetIdData(
    val id:String
)