package br.com.vw.uptime.schedule.core.models.maintenance

import com.google.gson.annotations.SerializedName

class ProductData (
    val items: List<Item>,
    @SerializedName("is_bundle")
    val isBundle: Boolean,
    val id: Long,
    val name: String,
    val sku: String,
    val price: Double,
    @SerializedName("is_active")
    val isActive: Boolean,
    @SerializedName("gtw_ref")
    val gtwRef: Any?,
)

data class Item(
    val items: List<Any?>,
    @SerializedName("is_bundle")
    val isBundle: Boolean,
    val id: Long,
    val name: String,
    val sku: String,
    val price: Double,
    @SerializedName("is_active")
    val isActive: Boolean,
    @SerializedName("gtw_ref")
    val gtwRef: Any?,
)