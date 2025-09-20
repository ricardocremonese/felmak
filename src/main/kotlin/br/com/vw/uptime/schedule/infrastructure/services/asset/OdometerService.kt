package br.com.vw.uptime.schedule.infrastructure.services.asset

interface OdometerService {
    fun odometerHourMeterByAssetsId(assetIds: List<String>, useHistory: Boolean? = true): List<AssetMetrics>
}