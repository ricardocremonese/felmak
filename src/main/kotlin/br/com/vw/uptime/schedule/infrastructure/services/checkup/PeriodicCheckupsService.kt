package br.com.vw.uptime.schedule.infrastructure.services.checkup

import br.com.vw.uptime.schedule.core.enums.maintenance.StepType
import br.com.vw.uptime.schedule.core.models.maintenance.*
import br.com.vw.uptime.schedule.core.utils.Cached
import br.com.vw.uptime.schedule.infrastructure.entities.checkup.CheckupTypeEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.CheckupOdpRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.RevisionData
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.CheckupTypeRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class PeriodicCheckupsService(
    private val checkupsOdpRepository: CheckupOdpRepository,
    private val checkupTypeRepository: CheckupTypeRepository
) {

    private val checkupTypeRepositoryCached = CheckupTypeRepositoryCached(checkupTypeRepository)

    fun getPeriodicCheckupsPreLoaded(
        vehicleCheckups: VehicleCheckups,
        schedules: List<CheckupSchedule>,
        checkupsOdp: List<RevisionData>
    ): CheckupStamps {
        val integratedMadeCheckups = checkupsOdp.map {
            val checkupTypes = checkupTypeRepositoryCached.findAll()
            StampCheckupOdp(it, checkupTypes)
        }.sortedBy {
            it.getMadeCheckup()?.finishedDate
        }
        val finishedSchedules = onlyFinishedSchedules(schedules)
        val finishedStamps = finishedSchedules.map {
            StampCheckupFromSchedule(
                vehicleCheckups.previousCheckup?.checkupSchedule,
                vehicleCheckups.previousCheckup?.checkup
            )
        }

        return CheckupStamps().apply {
            this.previousCheckups = (integratedMadeCheckups + finishedStamps).sortedBy { it.getMadeCheckup()?.finishedDate }
        }
    }

    private fun onlyFinishedSchedules(schedules: List<CheckupSchedule>): List<CheckupSchedule> {
        return schedules
            .filter {
                it.checkup != null &&
                it.vehicleSchedule.maintenance?.statusId == StepType.FINISHED.name
            }
    }

    fun integratedMadeCheckupsByChassis(chassis:String) : List<RevisionData> {
        val checkupsOdpList = checkupsOdpRepository.getVehicleInfoAndCheckups(listOf(chassis))
        if(checkupsOdpList.isEmpty()) {
            return listOf()
        }

        val revisions = checkupsOdpList[0].revisions
        if(revisions.isNullOrEmpty()) {
            return listOf()
        }
        return revisions
    }
}

interface StampCheckup {
    fun getCheckupType() : String
    fun getMadeCheckup() : MadeCheckup?
    fun getOrigin() : String
    fun getRange(): CheckupRange?
    fun getDealershipName(): String
    fun getConsultantName(): String
    fun getId(): String?
}

class MadeCheckup {
    var os:String? = null
    lateinit var finishedDate:LocalDate
    lateinit var metric:Metric
}

class StampCheckupFromSchedule(
    private val checkupSchedule: CheckupSchedule?,
    private val checkup: Checkup?
)  : StampCheckup {

    override fun getId(): String? {
        return checkupSchedule?.id?.toString()
    }

    override fun getOrigin(): String {
        return "upt"
    }

    override fun getRange(): CheckupRange {
        return checkupSchedule?.checkup?.range ?: checkup?.range!!
    }

    override fun getDealershipName(): String {
        return checkupSchedule?.vehicleSchedule?.dealership?.fantasyName ?: ""
    }

    override fun getConsultantName(): String {
        return checkupSchedule?.consultant?.let {
            it.firstName + " " + it.lastName
        } ?: ""
    }

    override fun getCheckupType(): String {
        return "S/D"
    }

    override fun getMadeCheckup(): MadeCheckup? {
        return checkupSchedule?.vehicleSchedule?.maintenance?.let {
            MadeCheckup().apply {
                os = it.serviceOrder
                finishedDate = it.checkoutDate?.toLocalDate()!!
                metric = checkupSchedule.let {
                    Metric().apply {
                        val vehicle = it.vehicleSchedule.vehicle
                        odometer = vehicle.odometer?.toDouble()
                        hourMeter = vehicle.hourMeter?.toDouble()
                    }
                }
            }
        }
    }

}

class Metric {
    var odometer:Double? = null
    var hourMeter: Double? = null
}

class StampCheckupOdp(
    private val revisionData: RevisionData,
    private val checkupTypes: List<CheckupTypeEntity>
) : StampCheckup {

    override fun getId(): String? {
        return ""
    }

    override fun getOrigin(): String {
        return "odp"
    }

    override fun getRange(): CheckupRange? {
        return null
    }

    override fun getCheckupType() : String {
        return checkupTypes.firstOrNull {
            it.code == revisionData.revisionCode
        }?.name ?: ""
    }

    override fun getDealershipName() : String {
        return revisionData.dealer ?: ""
    }

    override fun getConsultantName(): String {
        return revisionData.consultantName ?: ""
    }

    override fun getMadeCheckup(): MadeCheckup? {
        val date = revisionData.revisionDate
        val dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy")
        return MadeCheckup().apply {
            this.os = revisionData.serviceOrder
            this.finishedDate = LocalDate.parse(date, dateFormatter)
            this.metric = Metric().apply {
                this.odometer = revisionData.mileage?.toDouble()
                this.hourMeter = revisionData.hourMeter?.toDouble()
            }
        }
    }
}

class CheckupStamps {
    var previousCheckups:List<StampCheckup> = arrayListOf()
}

class CheckupTypeRepositoryCached(
    private val checkupTypeRepository: CheckupTypeRepository
) {

    private var cached = Cached<List<CheckupTypeEntity>> {
        checkupTypeRepository.findAll()
    }

    fun findAll(): List<CheckupTypeEntity> {
        return cached.get()
    }

}