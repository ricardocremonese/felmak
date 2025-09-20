package br.com.vw.uptime.schedule.core.models.maintenance

import com.google.gson.annotations.SerializedName

data class PlanData(
    @SerializedName("product_id")
    val productId: String,
    val amount: Long,
    @SerializedName("_embedded")
    val embedded: EmbeddedPlan,
)

data class EmbeddedPlan(
    val product: Product,
)

data class Product(
    val name: String,
    val legacy: Boolean,
    @SerializedName("product_type")
    val productType: String,
    @SerializedName("rate_plans")
    val ratePlans: List<RatePlan>?,
)

data class RatePlan(
    val name: String,
    val level: String,
    val currency: String,
    val price: Double,
    @SerializedName("variant_name")
    val variantName: String,
    @SerializedName("contract_period")
    val contractPeriod: String?,
)