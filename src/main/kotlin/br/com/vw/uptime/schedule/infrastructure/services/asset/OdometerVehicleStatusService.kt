package br.com.vw.uptime.schedule.infrastructure.services.asset

import br.com.vw.uptime.schedule.core.models.maintenance.VehicleMetrics
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.AssetsRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.VehicleStatusData
import org.springframework.context.annotation.Primary
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class OdometerVehicleStatusService(
    private val assetsRepository: AssetsRepository
) : OdometerService {

    override fun odometerHourMeterByAssetsId(assetIds:List<String>, useHistory: Boolean?) : List<AssetMetrics> {
        val vehicleStatusList = assetsRepository.getVehicleStatus(assetIds).map {
            toVehicleStatus(it)
        }
        return vehicleStatusList.map {
            AssetMetrics(
                assetId = it.assetId,
                VehicleMetrics().apply {
                    odometer = it.totalDistance?.toDouble()
                    hourMeter = it.engineHours?.toDouble()
                },
                dates = MetricDates()
            )
        }
    }

    fun toVehicleStatus(vehicleStatusData: VehicleStatusData) : AssetStatus {
        return vehicleStatusData.let {
            AssetStatus(
                assetId = it.vehicleId,
                vehicle = it.vehicle,
                status = it.status,
                nextService = it.nextService,
                engineHours =  hoursToLong(it.engineHours),
                totalDistance = distanceToLong(it.totalDistance),
                distanceFromDealership = distanceDealershipToDouble(it.distanceFromDealership),
                dealershipCity = it.dealershipCity,
                dealershipName = it.dealershipName
            )
        }
    }

    private fun hoursToLong(hours: String?): Long? {
        if(hours?.contains("-") == false) {
            return hours.split(":")[0].toLong()
        }
        return null
    }

    private fun distanceToLong(totalDistance: String?): Long? {
        if (totalDistance?.contains("-") == false) {
            return totalDistance
                .replace(" km", "")
                .replace(".", "")
                .toLong()
        }
        return null
    }

    private fun distanceDealershipToDouble(totalDistance: String?): Double? {
        if (totalDistance?.contains("-") == false) {
            if(totalDistance.contains(" km")) {
                return totalDistance
                    .replace(" km", "")
                    .replace(",", "")
                    .toDouble()
            }
            if(totalDistance.contains(" m")) {
                return totalDistance
                    .replace(" m", "")
                    .toDouble() / 1000
            }
        }
        return null
    }

}

data class AssetMetrics(
    val assetId:String,
    val vehicleMetrics: VehicleMetrics,
    val dates:MetricDates
)

data class MetricDates(
    var odometer: LocalDateTime? = null,
    var hourMeter:LocalDateTime? = null
)

class AssetStatus(
    val assetId:String,
    val vehicle:String?,
    val status:String?,
    val engineHours:Long?,
    val totalDistance:Long?,
    val distanceFromDealership:Double?,
    val nextService:String?,
    val dealershipCity:String?,
    val dealershipName:String?
)