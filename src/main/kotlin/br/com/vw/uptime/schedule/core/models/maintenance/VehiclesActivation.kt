package br.com.vw.uptime.schedule.core.models.maintenance

import com.google.gson.annotations.SerializedName

data class VehiclesActivation(
    @SerializedName("product_id")
    val productId: String,
    @SerializedName("resource_id")
    val resourceId: String,
    @SerializedName("resource_type")
    val resourceType: String,
    @SerializedName("resource_name")
    val resourceName: String,
    @SerializedName("activation_state")
    val activationState: String,
    @SerializedName("target_level")
    val targetLevel: String?,
    @SerializedName("origin_level")
    val originLevel: String?,
)