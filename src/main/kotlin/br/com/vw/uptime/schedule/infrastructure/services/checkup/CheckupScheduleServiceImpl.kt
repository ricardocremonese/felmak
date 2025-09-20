package br.com.vw.uptime.schedule.infrastructure.services.checkup

import br.com.vw.uptime.schedule.core.converters.CheckupScheduleConverter
import br.com.vw.uptime.schedule.core.converters.ConsultantConverter
import br.com.vw.uptime.schedule.core.enums.checkups.CheckupScheduleState
import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.enums.maintenance.StepType
import br.com.vw.uptime.schedule.core.enums.schedule.InviterType
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.models.Page
import br.com.vw.uptime.schedule.core.models.maintenance.Checkup
import br.com.vw.uptime.schedule.core.models.maintenance.CheckupRange
import br.com.vw.uptime.schedule.core.models.maintenance.CheckupSchedule
import br.com.vw.uptime.schedule.core.models.schedule.input.RescheduleInput
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.controllers.CheckupScheduleController
import br.com.vw.uptime.schedule.entrypoint.requests.RescheduleRequest
import br.com.vw.uptime.schedule.infrastructure.entities.checkup.CheckupChildEntity
import br.com.vw.uptime.schedule.infrastructure.entities.checkup.CheckupScheduleEntity
import br.com.vw.uptime.schedule.infrastructure.message.impl.OccurrenceMaintenanceManagerProducer
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.AssetPeriodData
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.CheckupScheduleRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.MaintenanceRepository
import br.com.vw.uptime.schedule.infrastructure.services.fieldAction.Campaign
import br.com.vw.uptime.schedule.infrastructure.services.maintenance.Status
import br.com.vw.uptime.schedule.infrastructure.services.schedule.ScheduleServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.user.Consultant
import br.com.vw.uptime.schedule.infrastructure.services.user.ConsultantsServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.user.UsersServiceImpl
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.YearMonth
import java.util.*


@Service
class CheckupScheduleServiceImpl(
    private val checkupScheduleRepository:CheckupScheduleRepository,
    private val scheduleServiceImpl: ScheduleServiceImpl,
    private val planServiceImpl: PlanServiceImpl,
    private val consultantsServiceImpl: ConsultantsServiceImpl,
    private val usrSvc:UserAuthServiceImpl,
    private val userService: UsersServiceImpl,
    private val maintenanceRepository: MaintenanceRepository,
    private val occurrenceMaintenanceManagerProducer: OccurrenceMaintenanceManagerProducer,
) {

    private val log = LoggerFactory.getLogger(CheckupScheduleController::class.java)

    fun checkupScheduleByVehicleChassis(chassis:String) : List<CheckupSchedule> {
        val checkupScheduleEntityList = checkupScheduleRepository.checkupScheduleByVehicleChassis(chassis)
        return checkupScheduleEntityList.map {
            toCheckupScheduleNoPlan(it)
        }
    }
    
    fun checkupScheduleByVehicleChassisList(chassisList: List<String>) : List<CheckupSchedule> {
        val checkupScheduleEntityList = checkupScheduleRepository.checkupScheduleByVehicleChassisList(chassisList)
        return checkupScheduleEntityList.map {
            toCheckupScheduleNoPlan(it)
        }
    }
    
    fun checkupScheduleByVehicleChassis(chassisList:Set<String>, state: String) : List<CheckupSchedule> {
        return chassisList.stream()
            .map {checkup ->  checkupScheduleRepository.getCheckupScheduleByChassisAndState(checkup, state)}
            .flatMap { entities -> entities.stream().map{s ->  toCheckupScheduleNoPlan(s) } }
            .toList()
    }
    
    fun getAllCheckupSchedules(
        accountId: String,
        checkupScheduleState: CheckupScheduleState?,
        date: String,
        queryChassis: String?,
        limit: Int,
        sortDirection: String?,
        encodedLastKey: String?,
        month: Int?,
        year: Int?
    ) : Page<CheckupSchedule> {
        val pageEntity = if(queryChassis.isNullOrBlank()) {
            
            checkupScheduleRepository.getCheckupScheduleByTowerAccountIdAndState(
                accountId = accountId,
                checkupScheduleState = checkupScheduleState,
                scheduledDate = date.let { if(it == "") null else LocalDate.parse(it) },
                month = month,
                year = year,
                sortDirection = sortDirection,
                limit = limit,
                encodedLastKey = encodedLastKey
            )
        } else {
            Page(
                items = checkupScheduleRepository.checkupScheduleByVehicleChassis(queryChassis),
                lastKey = null
            )
        }
        return Page(
            items = getSchedulesEntityToResponse(pageEntity.items),
            pageEntity.lastKey
        )
    }

    fun checkupScheduleByAssetId(assetId:String, user: UserAuthenticate) : List<CheckupSchedule> {
        val checkupScheduleEntityList = checkupScheduleRepository.checkupScheduleByAssetId(assetId, user)
        val plansWithProducts = planServiceImpl.getPlansAndAssets()
        return checkupScheduleEntityList.map {
           toCheckupSchedule(it, plansWithProducts)
        }
    }

    fun getSchedulesByMonthYear(month:Int, year:Int) : List<CheckupSchedule> {
        val scheduleEntityList = checkupScheduleRepository.checkupScheduleByMonth(month, year, usrSvc.usr())
        val plans = planServiceImpl.getPlansAndAssets()
        val plansWithProducts = planServiceImpl.getPlansAndAssets()
        val schedules = scheduleEntityList.map {
            val cs = toCheckupSchedule(it, plansWithProducts)
            cs.vehicleSchedule.plans = planServiceImpl.getPlansByAssetId(it.vehicleSchedule.vehicle.assetId, plans)
            cs
        }
        return schedules
    }

    fun getConsultantSchedulesByMonthYear(day:Optional<Int>, month:Int, year:Int) : List<CheckupSchedule> {

        val user = usrSvc.usr()
        val dates = day.map {dayOfAppointment ->  getMonthYear(dayOfAppointment, month, year) }
            .orElse( getMonthYear (month, year) )

        val scheduleEntityList = checkupScheduleRepository.checkupScheduleByDateAndConsultant(
            dates.first,
            dates.second,
            consultantsServiceImpl.consultantById(user.userId).dn
        )
        val plans = if(day.isEmpty)
            planServiceImpl.getPlansAndAssets()
        else
            arrayListOf()
        val schedules = scheduleEntityList
            .filter {
                it.consultant.id == user.userId
            }
            .map {
            val cs = toCheckupSchedule(it, plans)
            cs.consultant = ConsultantConverter.consultantEntityToConsultant(it.consultant)
            cs
        }
        return schedules
    }

    fun getMonthYear(day:Int, month:Int, year:Int) : Pair<LocalDateTime, LocalDateTime> {
        val startDate = LocalDate.of(year, month, day)
        val endDate = startDate.atTime(23, 59, 59)
        return Pair(startDate.atStartOfDay(), endDate)
    }

    fun getMonthYear(month:Int, year:Int) : Pair<LocalDateTime, LocalDateTime> {
        val yearMonth = YearMonth.of(year, month)
        val startDate = yearMonth.atDay(1).atStartOfDay()
        val endDate = yearMonth.atEndOfMonth().atTime(23, 59)
        return Pair(startDate, endDate)
    }

    fun toCheckupSchedule(checkupScheduleEntity: CheckupScheduleEntity, plansWithProducts: List<AssetPeriodData>) : CheckupSchedule {
        val checkupSchedule = CheckupScheduleConverter.checkupScheduleEntityToModel(checkupScheduleEntity)
        return with(checkupSchedule) {
            val plans = planServiceImpl.getPlansByAssetId(this.vehicleSchedule.vehicle.assetId, plansWithProducts)
            this.vehicleSchedule.plans = plans
            this.checkup = checkupScheduleEntity.checkup?.let { toCheckup(it) }
            this.campaigns = checkupScheduleEntity.campaigns.map {
                CheckupScheduleConverter.fieldCampaignChildToFieldCampaign(it)
            }
            this
        }
    }

    fun toCheckup(checkupEntity:CheckupChildEntity) : Checkup {
        return Checkup().apply {
            this.range = CheckupRange().apply {
                start = checkupEntity.value
            }
            this.maintenanceGroupId = checkupEntity.maintenanceGroupId
            this.type = checkupEntity.type
            this.hasCampaigns = checkupEntity.hasCampaigns
        }
    }

    fun toCheckupScheduleNoPlan(checkupScheduleEntity:CheckupScheduleEntity) : CheckupSchedule {
        val checkupSchedule = CheckupScheduleConverter.checkupScheduleEntityToModel(checkupScheduleEntity)
        return with(checkupSchedule) {
            this.checkup = checkupScheduleEntity.checkup?.let {
                toCheckup(it)
            }
            this
        }
    }

    fun getSchedulesByAccountId(accountId:String) : List<CheckupSchedule> {
        val schedulesEntity =  checkupScheduleRepository.getSchedulesByAccountId(accountId)
        return getSchedulesEntityToResponse(schedulesEntity)
    }

    fun getSchedulesByUserId(user:UserAuthenticate) : List<CheckupSchedule> {
        val schedulesEntity =  checkupScheduleRepository.getSchedulesByUser(user)
        return getSchedulesEntityToResponse(schedulesEntity)
    }

    fun getSchedulesByConsultantUser(user:UserAuthenticate, pageNumber:Int, limit:Int, wasViewed: Boolean) : List<CheckupSchedule> {
        return getSchedulesEntityToResponse(checkupScheduleRepository.getSchedulesByConsultantUser(user, pageNumber, limit, wasViewed))

    }

    fun getSchedulesByConsultantId(
        user:UserAuthenticate,
        checkupScheduleState: CheckupScheduleState?,
        date: String,
        queryChassis: String?,
        limit: Int,
        sortDirection: String?,
        encodedLastKey: String?
    ) : Page<CheckupSchedule> {
        val consultant = consultantsServiceImpl.consultantById(user.userId)
        val pageEntity = if(queryChassis.isNullOrBlank()) {
            checkupScheduleRepository.getSchedulesByConsultant(
                dealershipId = consultant.dn,
                checkupScheduleState = checkupScheduleState,
                scheduledDate = date.let { if(it == "") null else LocalDate.parse(it) },
                sortDirection = sortDirection,
                limit = limit,
                encodedLastKey = encodedLastKey
            )
        } else {
            Page(
                items = checkupScheduleRepository.checkupScheduleByVehicleChassis(queryChassis),
                lastKey = null
            )
        }
        return Page(
            items = getSchedulesEntityToResponse(pageEntity.items),
            pageEntity.lastKey
        )
    }

    fun getLatestSchedulesByUserId(userId:String) : List<CheckupSchedule> {
        val schedules =  checkupScheduleRepository.getSchedulesByUserIdAndStartDate(userId, LocalDateTime.now())
        return getSchedulesEntityToResponse(schedules.sortedByDescending { it.schedule.scheduledDate })
    }

    fun getAllActiveCheckupSchedules(page:Int, limit:Int) : List<CheckupSchedule> {
        val schedules =  checkupScheduleRepository.getAllActiveCheckupSchedule(page, limit)
        return schedules.map {
            toCheckupScheduleNoPlan(it)
        }
    }

    fun getSchedulesEntityToResponse(schedulesEntity:List<CheckupScheduleEntity>) : List<CheckupSchedule> {
        val plansWithProducts = planServiceImpl.getPlansAndAssets()
        val schedules = schedulesEntity.map {
            val cs = toCheckupSchedule(it, plansWithProducts)
            cs
        }
        return schedules
    }

    fun cancelSchedule(checkupScheduleId: String) {
        getCheckupScheduleOrThrow(checkupScheduleId).let { checkupScheduleEntity ->
            checkMaintenanceAlreadyInProgress(checkupScheduleId)
            val schedule = scheduleServiceImpl.rejectSchedule(checkupScheduleEntity.schedule.id.toString())
            val scheduleEntity = CheckupScheduleConverter.scheduleToScheduleEntityForCheckupSchedule(schedule)
            checkupScheduleEntity.schedule = scheduleEntity
            checkupScheduleRepository.updateCheckupSchedule(checkupScheduleEntity)
            occurrenceMaintenanceManagerProducer.sendMessageToDeleteMaintenance(checkupScheduleId)
        }
    }
    
    fun getScheduleById(checkupScheduleId: String): CheckupSchedule {
        val checkupScheduleEntity = getCheckupScheduleOrThrow(checkupScheduleId)
        val plansWithProducts = planServiceImpl.getPlansAndAssets()
        return toCheckupSchedule(checkupScheduleEntity, plansWithProducts)
    }

    fun getScheduleNoPlanById(checkupScheduleId: String): CheckupSchedule {
        val checkupScheduleEntity = getCheckupScheduleOrThrow(checkupScheduleId)
        return toCheckupScheduleNoPlan(checkupScheduleEntity)
    }

    fun reschedule(rescheduleRequest: RescheduleRequest) {
        val newConsultantId = rescheduleRequest.consultantId
        val checkupScheduleEntity = getCheckupScheduleOrThrow(rescheduleRequest.id)
        checkMaintenanceAlreadyInProgress(rescheduleRequest.id)
        val consultant = consultantsServiceImpl.getConsultantOrDealershipAvailable(
            newConsultantId,
            rescheduleRequest.dealershipId,
            rescheduleRequest.rescheduleDate!!
        )
        val schedule = scheduleServiceImpl.reschedule(with(RescheduleInput()) {
            this.id = checkupScheduleEntity.schedule.id.toString()
            this.rescheduleDate = rescheduleRequest.rescheduleDate!!
            this
        })
        val scheduleEntity = CheckupScheduleConverter.scheduleToScheduleEntityForCheckupSchedule(schedule, checkupScheduleEntity.consultant.id)
        val rescheduleBy = rescheduleRequest.rescheduledBy!!
        checkupScheduleEntity.schedule = scheduleEntity.apply {
            destinationAccountId = consultant.accountId
            destinationUserId = consultant.id
        }
        checkupScheduleEntity.consultant = ConsultantConverter.consultantToEntity(consultant)
        checkupScheduleEntity.waitFor = chooseWaitFor(rescheduleBy, checkupScheduleEntity.towerUserId).name
        checkupScheduleRepository.updateCheckupSchedule(checkupScheduleEntity)
    }

    fun updateNotificationVisibility(checkupScheduleId: String) {
        getCheckupScheduleOrThrow(checkupScheduleId).let { checkupSchedule ->
            log.info("Agendamento com id $checkupScheduleId localizado. Atualizar o agendamento para já visualizado pelo consultor.")
            checkupSchedule.wasViewed = true
            checkupScheduleRepository.updateCheckupSchedule(checkupSchedule)
            log.info("Update finalizado. Consultor não deverá mais receber notificações")
        }
    }

    fun chooseWaitFor(createdByType: InviterType, towerUserId:String?): InviterType {
        return when(createdByType) {
            InviterType.MANAGER -> InviterType.CONSULTANT
            InviterType.CONSULTANT -> if (towerUserId != null)InviterType.TOWER else InviterType.MANAGER
            InviterType.TOWER -> InviterType.CONSULTANT
            else -> throw BusinessException(ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(), "Invalid type to create schedule"))
        }
    }

    private fun getCheckupScheduleOrThrow(checkupScheduleId: String): CheckupScheduleEntity {
        return this.checkupScheduleRepository.getCheckupScheduleById(checkupScheduleId)
            ?: throw BusinessException(
                ErrorCode.NO_CHECKUP_SCHEDULE_FOUND.toResponse()
            )
    }

    fun fieldCampaignsAvailable(fieldCampaigns:List<Campaign>, checkupSchedule: List<CheckupSchedule>) : List<Campaign> {
        val availableFieldCampaigns = arrayListOf<Campaign>()
        for(oneFieldCampaign in fieldCampaigns) {
            if(!existsFieldCampaign(oneFieldCampaign, checkupSchedule)) {
                availableFieldCampaigns.add(oneFieldCampaign)
            }
        }
        return availableFieldCampaigns
    }

    private fun existsFieldCampaign(fieldCampaign: Campaign, allFieldSchedule: List<CheckupSchedule>) : Boolean {
        return allFieldSchedule.any {
            it.campaigns.any { oneCampaign ->
                oneCampaign.number == fieldCampaign.number
            }
        }
    }

    private fun getManagerName(sourceUserId: String, consultant: Consultant): String {
        if (sourceUserId != consultant.id) {
            val user = userService.getUserById(sourceUserId)
            return "${user.firstName} ${user.lastName}"
        }
        return "${consultant.firstName} ${consultant.lastName}"
    }

    fun acceptSchedule(checkupScheduleId: String) {
        val checkupScheduleEntity = getCheckupScheduleOrThrow(checkupScheduleId)
        val schedule = scheduleServiceImpl.acceptSchedule(checkupScheduleEntity.schedule.id.toString())
        val scheduleEntity = CheckupScheduleConverter.scheduleToScheduleEntityForCheckupSchedule(schedule)
        checkupScheduleEntity.schedule = scheduleEntity
        checkupScheduleRepository.updateCheckupSchedule(checkupScheduleEntity)
    }

    private fun checkMaintenanceAlreadyInProgress(checkupScheduleId: String) {
        maintenanceRepository.findByMaintenanceScheduleId(checkupScheduleId)?.let { maintenanceEntity ->
            throw BusinessException(
                ErrorCodeResponse(
                    HttpStatus.UNPROCESSABLE_ENTITY.value().toString(),
                    "Não é possível alterar o angendamento. Já existe uma manutenção em andamento."
                )
            )
        }
    }

    fun validateCheckupScheduled(chassis: String): Status {
        val schedules = checkupScheduleByVehicleChassis(chassis)
        val foundSchedule = schedules.firstOrNull {
            it.vehicleSchedule.maintenance?.statusId != StepType.FINISHED.name
        }
        return if (foundSchedule != null) {
            Status(
                status = "scheduled"
            )
        } else {
            Status(
                status = "not_scheduled"
            )
        }
    }
}