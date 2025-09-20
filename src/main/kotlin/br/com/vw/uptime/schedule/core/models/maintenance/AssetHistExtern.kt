package br.com.vw.uptime.schedule.core.models.maintenance

import com.google.gson.annotations.SerializedName

data class AssetHistExtern(
    @SerializedName("asset_id")
    val assetId: String,
    val mileage: Mileage?,
    @SerializedName("fuel_level")
    val fuelLevel: FuelLevel,
    val position: Position,
)

data class Mileage(
    val value: Double,
    @SerializedName("occurred_at")
    val occurredAt: String,
)

data class FuelLevel(
    val value: Double,
    @SerializedName("occurred_at")
    val occurredAt: String,
)

data class Position(
    val value: GeoLocation,
)

data class GeoLocation(
    val latitude: Double,
    val longitude: Double,
)