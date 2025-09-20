package br.com.vw.uptime.schedule.core.models.drivers

import com.google.gson.annotations.SerializedName

data class DriverData(
    @SerializedName("account_id")
    val accountId: String,
    val id: String,
    @SerializedName("first_name")
    val firstName: String,
    @SerializedName("last_name")
    val lastName: String,
    @SerializedName("display_name")
    val displayName: String,
    @SerializedName("email")
    val email: String,
    @SerializedName("phone_number")
    val phoneNumber:String,
    val status: String,
    @SerializedName("_embedded")
    val embedded: Embedded,
)

data class Embedded(
    val identifications: List<Identification>,
    val tags: List<Any?>,
)

data class Identification(
    val id: String,
    @SerializedName("identification_type")
    val identificationType: String,
    val identification: String,
)