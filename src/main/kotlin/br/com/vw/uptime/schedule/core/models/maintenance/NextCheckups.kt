package br.com.vw.uptime.schedule.core.models.maintenance

import br.com.vw.uptime.schedule.core.enums.schedule.ScheduleStateEnum
import br.com.vw.uptime.schedule.infrastructure.services.checkup.StampCheckup
import java.time.LocalDateTime
import java.time.LocalTime

class NextCheckups {
    var canSchedule = false
    var title:String = ""
    var checkup:Checkup? = null
    var schedule: ScheduleMaintenanceInfo? = null
    var maintenance:Maintenance? = null
}

class ScheduleMaintenanceInfo(
    private val checkupSchedule:CheckupSchedule?,
    private val checkup:Checkup?
) {

    fun getId():String {
        return checkupSchedule?.id.toString()
    }

    fun getScheduledDate():LocalDateTime? {
        return checkupSchedule?.schedule?.scheduledDate
    }

    fun getState():String {
        if(checkupSchedule == null) {
            if(checkup == null) {
                return "Sem agendamento"
            }
            return "Disponível para agendar"
        }
        return ScheduleStateEnum.getDescriptionByState(checkupSchedule.schedule.state)
    }

    fun getHourmeter():Long {
        return checkupSchedule?.vehicleSchedule?.vehicle?.hourMeter ?: 0
    }

    fun getOdometer():Long {
        return checkupSchedule?.vehicleSchedule?.vehicle?.odometer ?: 0
    }
}

class StampLast {
    var canSchedule = false
    var title:String = ""
    var checkup:Checkup? = null
    var schedule: StampMaintenanceInfo? = null
    var maintenance:MaintenanceStamp? = null
    var origin:String? = null
}

class StampMaintenanceInfo(
    private val stampCheckup: StampCheckup
) {

    fun getId():String {
        return stampCheckup.getId() ?: ""
    }

    fun getScheduledDate():LocalDateTime? {
        return stampCheckup.getMadeCheckup()?.finishedDate?.let { LocalDateTime.of(it, LocalTime.of(0, 0)) }
    }

    fun getState():String {
        return ""
    }

    fun getHourmeter():Long {
        return stampCheckup.getMadeCheckup()?.metric?.hourMeter?.toLong() ?: 0
    }

    fun getOdometer():Long {
        return stampCheckup.getMadeCheckup()?.metric?.odometer?.toLong() ?: 0
    }
}

class MaintenanceStamp {
    lateinit var statusId:String
    var checkoutDate:LocalDateTime? = null
    var serviceOrder:String? = null
    lateinit var checkupType:String
    lateinit var dealershipName:String
    lateinit var consultantName:String
}