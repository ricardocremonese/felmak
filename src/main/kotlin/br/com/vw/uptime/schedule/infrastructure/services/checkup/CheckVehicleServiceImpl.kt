package br.com.vw.uptime.schedule.infrastructure.services.checkup

import br.com.vw.uptime.schedule.core.enums.checkups.MaintenanceGroupEnum
import br.com.vw.uptime.schedule.core.enums.checkups.MetricTypeEnum
import br.com.vw.uptime.schedule.core.enums.maintenance.StepType
import br.com.vw.uptime.schedule.core.models.maintenance.*
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import kotlin.math.max

@Service
class CheckVehicleServiceImpl(
    private val checkupInterval: CheckupInterval
) {

    @Value("\${left-km-for-checkup}")
    var leftKmForCheckup:Long = 0

    @Value("\${left-hour-for-checkup}")
    var leftHourForCheckup:Long = 0

    companion object {
        fun odometerOrHourMeter(group:String, vehicleMetrics: VehicleMetrics): Double? {

            MaintenanceGroupEnum.entries.firstOrNull {
                it.value() == group
            }  ?: throw IllegalArgumentException("Invalid maintenance group value: $group")

            return if(group != MaintenanceGroupEnum.ESPECIAL.value()) {
                vehicleMetrics.odometer
            } else {
                vehicleMetrics.hourMeter
            }
        }
    }

    fun check(vehicleParams: VehicleParams, schedules: List<CheckupSchedule>, latestOdometerRevision: Double = 0.0) : VehicleCheckups {
        val schedulesWithSortedCheckups = sortedAndOnlySchedulesWithCheckups(schedules)
        val maintenanceGroupId = vehicleParams.group ?: return checkPreviousAndNextSchedule(schedules)
        val interval = checkupInterval.getCheckupInterval(
            vehicleParams.chassis,
            maintenanceGroupId
        )
        if(interval == null) {
            return checkPreviousAndNextSchedule(schedules)
        }
        val metricValue = odometerOrHourMeter(
            maintenanceGroupId,
            vehicleParams.vehicleMetrics
        )
        if(metricValue == null && latestOdometerRevision == 0.0) {
            return checkPreviousAndNextSchedule(schedules)
        }
        val newMetricValue = maxOrNull(metricValue?.toLong(), if(latestOdometerRevision == 0.0) null else latestOdometerRevision.toLong())
        if(newMetricValue == null) {
            return checkPreviousAndNextSchedule(schedules)
        }
        val nextCheckupValue = getNextCheckup(newMetricValue, interval)
        return getVehicleCheckups(nextCheckupValue, schedulesWithSortedCheckups, interval)
    }

    fun maxOrNull(first:Long?, second:Long?) : Long? {
        if(first == null) {
            return second
        }
        if(second == null) {
            return first
        }
        return max(first,  second)
    }

    fun getNextCheckupWithRange(vehicleParams: VehicleParams, latestOdometerRevision: Double = 0.0) : Long? {
        val maintenanceGroupId = vehicleParams.group
        if(maintenanceGroupId  == null) {
            return null
        }
        val interval = checkupInterval.getCheckupInterval(
            vehicleParams.chassis,
            maintenanceGroupId
        )
        if(interval == null) {
            return null
        }
        val metricValue = odometerOrHourMeter(
            maintenanceGroupId,
            vehicleParams.vehicleMetrics
        )?.toLong()
        if(metricValue == null) {
            return null
        }
        val nextCheckup = getNextCheckup(metricValue, interval)
        val currentCheckup = nextCheckup - interval
        val adjustedCurrent = currentCheckup + 3000


        if(metricValue >= currentCheckup && metricValue <= adjustedCurrent) {
            return currentCheckup
        }
        if(metricValue > adjustedCurrent && metricValue <= nextCheckup) {
            return nextCheckup
        }
        return null
    }

    fun isLate(vehicleParams: VehicleParams, checkupScheduleList:List<CheckupSchedule>) : Boolean {
        val maintenanceGroupId = vehicleParams.group
        if(maintenanceGroupId == null) {
            return false
        }
        val interval = checkupInterval.getCheckupInterval(
            vehicleParams.chassis,
            maintenanceGroupId
        )
        if(interval == null) {
            return false
        }
        val metricValue = odometerOrHourMeter(
            maintenanceGroupId,
            vehicleParams.vehicleMetrics
        )?.toLong()
        if(metricValue == null) {
            return false
        }
        val nextCheckup = getNextCheckup(metricValue, interval)
        if(nextCheckup != metricValue) {
            val nextCheckupBefore = nextCheckup - interval
            val lastMadeCheckup = checkupScheduleList.maxByOrNull { it.checkup?.range?.start ?: 0L }?.checkup?.range?.start ?: 0
            if(lastMadeCheckup == nextCheckupBefore) {
                return false
            }
            val nextCheckupFinal = nextCheckup - 5000
            if(metricValue > nextCheckupBefore && metricValue < nextCheckupFinal) {
                return true
            }
        }

        return false
    }


    private fun sortedAndOnlySchedulesWithCheckups(schedules: List<CheckupSchedule>): List<CheckupSchedule> {
        val schedulesWithCheckups = schedules.filter {
            it.checkup != null
        }
        val sortedSchedulesByStartRange = schedulesWithCheckups.sortedByDescending {
            it.checkup?.range?.start
        }
        return sortedSchedulesByStartRange
    }

    private fun checkPreviousAndNextSchedule(sortedSchedulesByStartRange: List<CheckupSchedule>): VehicleCheckups {
        if(sortedSchedulesByStartRange.isEmpty()) {
            return VehicleCheckups()
        }
        val mostScheduleRange = sortedSchedulesByStartRange.first()
        if(isScheduleFinished(mostScheduleRange)) {
            return VehicleCheckups().apply {
                this.previousCheckup = CheckupAndSchedule().apply {
                    checkupSchedule = mostScheduleRange
                    checkup = null
                }
            }
        } else {
            return VehicleCheckups().apply {
                val previousCheckup =  if(sortedSchedulesByStartRange.size >= 2) sortedSchedulesByStartRange[1] else null
                this.previousCheckup = CheckupAndSchedule().apply {
                    checkupSchedule = previousCheckup
                    checkup = null
                }
                this.nextCheckup = CheckupAndSchedule().apply {
                    checkupSchedule = mostScheduleRange
                    checkup = Checkup().apply {
                        this.range = CheckupRange().apply {
                            start = mostScheduleRange.checkup!!.range.start
                        }
                    }
                }
            }
        }
    }

    private fun getVehicleCheckups(
        nextCheckupValue: Long,
        schedules: List<CheckupSchedule>,
        interval: Long
    ): VehicleCheckups {
        val lastNextCheckup = getLastAndNext(nextCheckupValue, schedules, interval)
        return lastNextCheckup
    }

    private fun getLastAndNext(
        nextCheckupValue: Long,
        sortedSchedulesByStartRange: List<CheckupSchedule>,
        interval: Long
    ): VehicleCheckups {
        if(sortedSchedulesByStartRange.isEmpty()) {
            return VehicleCheckups().apply {
                this.nextCheckup = CheckupAndSchedule().apply {
                    this.checkup = Checkup().apply {
                        this.range = CheckupRange().apply {
                            this.start = nextCheckupValue
                        }
                    }
                }
            }
        }
        val mostScheduleByStart = sortedSchedulesByStartRange.first()
        if(isScheduleFinished(mostScheduleByStart)) {
            return VehicleCheckups().apply {
                this.previousCheckup = CheckupAndSchedule().apply {
                    checkupSchedule = mostScheduleByStart
                    checkup = null
                }
                val newNextCheckupValue = rangeCurrentOrNext(mostScheduleByStart.checkup!!.range.start, interval)
                this.nextCheckup = CheckupAndSchedule().apply {
                    checkupSchedule = null
                    checkup = Checkup().apply {
                        this.range = CheckupRange().apply {
                            start = newNextCheckupValue
                        }
                    }
                }
            }
        } else {
            return VehicleCheckups().apply {
                val previousCheckup =  if(sortedSchedulesByStartRange.size >= 2) sortedSchedulesByStartRange[1] else null
                this.previousCheckup = CheckupAndSchedule().apply {
                    checkupSchedule = previousCheckup
                    checkup = null
                }
                this.nextCheckup = CheckupAndSchedule().apply {
                    checkupSchedule = mostScheduleByStart
                    checkup = Checkup().apply {
                        this.range = CheckupRange().apply {
                            start = mostScheduleByStart.checkup!!.range.start
                        }
                    }
                }
            }
        }
    }

    class NearCheckupChecking(
        private val odometerOrHourMeter:Long,
        val metricType:MetricTypeEnum,
        private val maxLeftKm:Long,
        private val maxLeftHour:Long
    ) {
        fun isCheckupNear(nextCheckupValue: Long) : Boolean {
            val leftValue = when(metricType) {
                MetricTypeEnum.ODOMETER -> maxLeftKm
                MetricTypeEnum.HOUR_METER -> maxLeftHour
            }
            val odometerOrHourMeterLeft = nextCheckupValue - odometerOrHourMeter
            return odometerOrHourMeterLeft <= leftValue
        }
    }

    private fun rangeCurrentOrNext(checkupStartRange: Long, interval: Long): Long {
        val nextCheckupRange = getNextCheckup(value=checkupStartRange, range= interval)
        if(nextCheckupRange == checkupStartRange) {
            return nextCheckupRange + interval
        }
        return nextCheckupRange
    }

    fun isScheduleFinished(schedule:CheckupSchedule): Boolean {
        return schedule.vehicleSchedule.maintenance?.statusId == StepType.FINISHED.name
                && schedule.checkup != null
    }


    fun getNextCheckup(value:Long, range:Long) : Long {
        return (value + range - 1) / range * range
    }
}

class VehicleCheckups {
    var nextCheckup:CheckupAndSchedule? = null
    var previousCheckup:CheckupAndSchedule? = null
    var afterNextCheckup = arrayListOf<CheckupAndSchedule>()
}

class CheckupAndSchedule {
    var checkup:Checkup? = null
    var checkupSchedule:CheckupSchedule? = null
}
