package br.com.vw.uptime.schedule.entrypoint.responses

data class VehicleWithMetricsResponse(
    val id: String,
    val name: String?,
    val identification: String?,
    val licensePlate: String?,
    val odometer: Long?,
    val hourmeter: Long?,
    val model: String?,
    val modelCode: String?,
    val saleDate:String?,
    val accountId: String?,
    val accountName: String?,
    val accountAssetId: String?
) 