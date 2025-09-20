package br.com.vw.uptime.schedule.infrastructure.services.asset

import br.com.vw.uptime.schedule.core.models.maintenance.AssetHistExtern
import br.com.vw.uptime.schedule.core.models.maintenance.VehicleMetrics
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.AssetsRepository
import org.springframework.context.annotation.Primary
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Primary
@Service
class OdometerInstantWithHist(
    private val assetsRepository: AssetsRepository
) : OdometerService{


    override fun odometerHourMeterByAssetsId(assetIds: List<String>, useHistory: Boolean?): List<AssetMetrics> {
        val assetMetricsInstant = OdometerInstantService(assetsRepository).odometerHourMeterByAssetsId(assetIds)
        val assetsNoOdometer = getAssetsIdNoOdometer(assetIds, assetMetricsInstant)
        if(assetsNoOdometer.isEmpty() || useHistory == false) {
            return assetMetricsInstant
        }
        val assetMetricsList = arrayListOf<AssetMetrics>()
        val assetHistList = assetsRepository.getAssetsHistory()
        for(assetId in assetsNoOdometer) {
            val assetHist = assetHistList.firstOrNull {
                it.assetId == assetId
            }
            if(assetHist == null) {
                continue
            }
            val assetMetricInstant = assetMetricsInstant.firstOrNull {
                it.assetId == assetId
            }
            if(assetMetricInstant != null){
                assetMetricInstant.vehicleMetrics.odometer = assetHist.mileage?.value
                assetMetricInstant.dates.odometer = assetHist.mileage?.let {
                    LocalDateTime.parse(it.occurredAt, DateTimeFormatter.ISO_DATE_TIME)
                }
                continue
            }
            assetMetricsList.add(
                assetHistToAssetMetric(assetHist)
            )
        }
        return assetMetricsInstant + assetMetricsList
    }


//    override fun odometerHourMeterByAssetsId(assetIds: List<String>): List<AssetMetrics> {
//        val assetMetricsInstant = OdometerInstantService(assetsRepository).odometerHourMeterByAssetsId(assetIds)
//        val assetsNoOdometer = getAssetsIdNoOdometer(assetIds, assetMetricsInstant)
//        val assetMetricsList = arrayListOf<AssetMetrics>()
//        for(assetId in assetsNoOdometer) {
//            val assetHist = assetsRepository.getAssetsHistoryByAssetId(assetId)
//            if(assetHist == null) {
//                continue
//            }
//            assetMetricsList.add(
//                AssetMetrics(
//                    assetId = assetId,
//                    vehicleMetrics = VehicleMetrics().apply {
//                        this.odometer = assetHist.mileage?.value
//                    },
//                    dates = MetricDates(
//                        odometer = assetHist.mileage?.occurredAt?.let {
//                            LocalDateTime.parse(it, DateTimeFormatter.ISO_DATE_TIME)
//                        }
//                    )
//                )
//            )
//        }
//        return assetMetricsInstant + assetMetricsList
//    }

    fun assetHistToAssetMetric(assetHist:AssetHistExtern): AssetMetrics {
        return AssetMetrics(
            assetId = assetHist.assetId,
            vehicleMetrics = VehicleMetrics().apply {
                this.odometer = assetHist.mileage?.value
            },
            dates = MetricDates(
                odometer = assetHist.mileage?.occurredAt?.let {
                    LocalDateTime.parse(it, DateTimeFormatter.ISO_DATE_TIME)
                }
            )
        )
    }

    fun getAssetsIdNoOdometer(assetIds: List<String>, assetMetricsInstant: List<AssetMetrics>): List<String> {
        val assetsNoMetrics = assetIds.filter { assetId ->
            !assetMetricsInstant.any { assetMetric ->
                assetId == assetMetric.assetId
            }
        }
        val assetsNoOdometer = assetMetricsInstant.filter {
            it.vehicleMetrics.odometer == null
        }.map {
            it.assetId
        }
        return assetsNoMetrics + assetsNoOdometer
    }
}