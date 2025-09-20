package br.com.vw.uptime.schedule.infrastructure.services.asset

import br.com.vw.uptime.schedule.core.models.maintenance.VehicleMetrics
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.AssetsRepository
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId

@Service
class OdometerInstantService(
    private val assetsRepository: AssetsRepository
) : OdometerService {

    companion object {
        private const val ODOMETER_TYPE = "TOTAL_DISTANCE"
        private const val HOUR_METER_TYPE = "ENGINE_HOURS"
    }

    override fun odometerHourMeterByAssetsId(assetIds: List<String>, useHistory: Boolean?): List<AssetMetrics> {
        val list = assetsRepository.getInstantDiagnosticByAssets(assetIds)
        val assetMetricsMap = mutableMapOf<String, AssetMetrics>()
        for(instantDiag in list) {
            val assetMetric = assetMetricsMap[instantDiag.assetId] ?: AssetMetrics(
                assetId = instantDiag.assetId,
                vehicleMetrics = VehicleMetrics(),
                dates = MetricDates()
            )
            if(instantDiag.type == ODOMETER_TYPE) {
                assetMetric.vehicleMetrics.odometer = instantDiag.value / 1000
                assetMetric.dates.odometer = millisToLocalDateTime(instantDiag.refUtc)
            }
            if(instantDiag.type == HOUR_METER_TYPE) {
                assetMetric.vehicleMetrics.hourMeter = instantDiag.value
                assetMetric.dates.hourMeter = millisToLocalDateTime(instantDiag.refUtc)
            }
            assetMetricsMap[instantDiag.assetId] = assetMetric
        }
        return assetMetricsMap.values.toList()
    }

    fun millisToLocalDateTime(refUtc:String) : LocalDateTime? {
        val seconds = refUtc.toDouble().toLong()
        val nanos = ((refUtc.toDouble() - seconds) * 1_000_000_000).toInt()
        val instant = Instant.ofEpochSecond(seconds, nanos.toLong())
        val date = LocalDateTime.ofInstant(instant, ZoneId.of("UTC"))
        return date
    }
}