package br.com.vw.uptime.schedule.infrastructure.services.maintenance

import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.enums.checkups.MaintenanceGroupEnum
import br.com.vw.uptime.schedule.core.enums.checkups.MetricTypeEnum
import br.com.vw.uptime.schedule.core.models.maintenance.CheckupRange
import br.com.vw.uptime.schedule.core.models.maintenance.CheckupSchedule
import br.com.vw.uptime.schedule.core.models.maintenance.VehicleMetrics
import br.com.vw.uptime.schedule.core.models.maintenance.VehicleParams
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.PartsEntity
import br.com.vw.uptime.schedule.infrastructure.services.asset.PartsService
import br.com.vw.uptime.schedule.infrastructure.services.checkup.CheckVehicleServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.checkup.CheckupScheduleServiceImpl
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDateTime

@Service
class CheckupsService(
    val checkVehicleServiceImpl: CheckVehicleServiceImpl,
    val checkupScheduleServiceImpl: CheckupScheduleServiceImpl,
    val partsService: PartsService
) {

    fun getCheckupInfo(
        chassis: String,
        maintenanceGroup: String,
        odometer: Double,
        hourMeter: Double?,
        model: String?
    ) : CheckupResponse {
        val schedules = checkupScheduleServiceImpl.checkupScheduleByVehicleChassis(chassis)
        val vehicleCheckups = checkVehicleServiceImpl.getNextCheckupWithRange(
            VehicleParams().apply {
                this.chassis = chassis
                this.group = maintenanceGroup
                this.vehicleMetrics = VehicleMetrics().apply {
                    this.odometer = odometer
                    this.hourMeter = hourMeter
                }
            }
        )
        return CheckupResponse(
            range = vehicleCheckups?.let {
                getRange(vehicleCheckups)
            } ?: getRange(0),
            parts = vehicleCheckups?.let {
                getParts(
                    chassis,
                    maintenanceGroup,
                    it,
                    model
                )
            } ?: emptyList(),
            metricType = MetricTypeEnum.getMetricTypeByGroupId(maintenanceGroup).label,
            status = getStatus(vehicleCheckups, schedules)
        )
    }

    fun getRange(nextCheckup:Long) : Range {
        return Range(nextCheckup)
    }

    private fun checkupRangeToRange(checkupRange: CheckupRange): Range {
        return Range(checkupRange.start)
    }

    // checkupSchedule must not be in maintenance finished if not null
    fun getStatus(nextCheckup: Long?, schedules: List<CheckupSchedule>) : Status {

        val foundSchedule = schedules.firstOrNull {
            it.checkup?.range?.start == nextCheckup
        }
        if(foundSchedule != null) {
            return Status(
                status = "scheduled",
                scheduleDate = foundSchedule.schedule.scheduledDate
            )
        }
        return Status(
            status = "not_scheduled"
        )
    }

    fun getParts(chassis:String, maintenanceGroupId:String, nextCheckupRangeStart:Long, modelCode:String?) : List<Part> {
        try {
                val partEntityList = if (modelCode != null)
                    partsService.getPartsByModelCode(
                        modelCode,
                        MaintenanceGroupEnum.byId(maintenanceGroupId),
                        nextCheckupRangeStart
                    )
                else
                    partsService.getPartsByChassis(
                        chassis,
                        maintenanceGroupId,
                        nextCheckupRangeStart
                    )

            return partEntityList.map { entityToPart(it) }
        } catch (ex:BusinessException) {
            if(ex.errorCode.code == ErrorCode.MODEL_NOT_FOUND_BY_CHASSIS.code) {
                return listOf()
            } else {
                throw ex
            }
        }
    }

    fun entityToPart(partEntity: PartsEntity): Part {
        return partEntity.maintenanceParts!!.let {
            Part(
                it.code,
                it.description,
                it.quantity
            )
        }
    }
}

data class CheckupResponse(
    val range: Range,
    val parts: List<Part>,
    val metricType: String,
    val status: Status
)

data class Range(
    val start: Long
)

data class Part(
    val code: String,
    val description: String,
    val qtd: BigDecimal
)

data class CheckupRequest(
    val chassis:String,
    val maintenanceGroup:String,
    val odometer:Double,
    val hourMeter:Double?
)

data class Status(
    val status:String,
    val scheduleDate:LocalDateTime? = null,
    val checkInDate:LocalDateTime? = null,
    val checkOutDate:LocalDateTime? = null
)