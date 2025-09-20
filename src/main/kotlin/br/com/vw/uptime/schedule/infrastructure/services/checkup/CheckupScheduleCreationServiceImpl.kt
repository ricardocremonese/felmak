package br.com.vw.uptime.schedule.infrastructure.services.checkup

import br.com.vw.uptime.schedule.core.converters.CheckupScheduleConverter
import br.com.vw.uptime.schedule.core.converters.ConsultantConverter
import br.com.vw.uptime.schedule.core.converters.Mapping
import br.com.vw.uptime.schedule.core.converters.NotificationWrapperConverter
import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.enums.schedule.ScheduleStateEnum
import br.com.vw.uptime.schedule.core.enums.schedule.InviterType
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.models.maintenance.Checkup
import br.com.vw.uptime.schedule.core.models.maintenance.CheckupRange
import br.com.vw.uptime.schedule.core.models.maintenance.CheckupSchedule
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.controllers.CheckupScheduleController
import br.com.vw.uptime.schedule.entrypoint.requests.CheckupScheduleRequest
import br.com.vw.uptime.schedule.infrastructure.entities.checkup.CampaignScheduleChild
import br.com.vw.uptime.schedule.infrastructure.entities.checkup.CheckupChildEntity
import br.com.vw.uptime.schedule.infrastructure.entities.checkup.CheckupScheduleEntity
import br.com.vw.uptime.schedule.infrastructure.entities.checkup.DealershipChild
import br.com.vw.uptime.schedule.infrastructure.message.impl.OccurrenceMaintenanceManagerProducer
import br.com.vw.uptime.schedule.infrastructure.notification.Notifier
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.CheckupScheduleRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.sequence.SequenceRepository
import br.com.vw.uptime.schedule.infrastructure.services.asset.AssetsDbService
import br.com.vw.uptime.schedule.infrastructure.services.dealership.DealershipServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.dynamics.DynamicsService
import br.com.vw.uptime.schedule.infrastructure.services.fieldAction.Campaign
import br.com.vw.uptime.schedule.infrastructure.services.fieldAction.FieldCampaignServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.schedule.ScheduleInput
import br.com.vw.uptime.schedule.infrastructure.services.schedule.ScheduleServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.user.Consultant
import br.com.vw.uptime.schedule.infrastructure.services.user.ConsultantsServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.user.UsersServiceImpl
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.*

@Service
class CheckupScheduleCreationServiceImpl(
    private val checkupScheduleRepository: CheckupScheduleRepository,
    private val scheduleServiceImpl: ScheduleServiceImpl,
    private val planServiceImpl: PlanServiceImpl,
    private val consultantsServiceImpl: ConsultantsServiceImpl,
    private val dealershipServiceImpl: DealershipServiceImpl,
    private val fieldActionServiceImpl: FieldCampaignServiceImpl,
    private val assetsDbService: AssetsDbService,
    private val dynamicsService: DynamicsService,
    private val pushNotification: Notifier,
    private val userService: UsersServiceImpl,
    private val sequenceRepository: SequenceRepository,
    private val occurrenceMaintenanceManagerProducer: OccurrenceMaintenanceManagerProducer
) {

    private val log = LoggerFactory.getLogger(CheckupScheduleController::class.java)


    @Value("\${tower-account-id}")
    private lateinit var controlTowerAccountId: String

    fun createCheckupSchedule(checkupScheduleRequest: CheckupScheduleRequest, user: UserAuthenticate) : CheckupSchedule {
        validateCheckupScheduleRequest(checkupScheduleRequest)
        val chosenConsultant = getConsultant(checkupScheduleRequest)
        val assetId = checkupScheduleRequest.vehicleSchedule.vehicle.assetId
        val checkupSchedules = checkupScheduleFromUser(assetId, user)
        validateAlreadyExistsScheduleForCheckup(checkupScheduleRequest, checkupSchedules)
        val protocol = dynamicsService.acquireProtocol()
        val campaigns = getFieldAction(checkupScheduleRequest, checkupSchedules)
        val newId = UUID.randomUUID()
        val scheduleInput = with(ScheduleInput()) {
            this.booking = newId.toString()
            this.scheduledDate = checkupScheduleRequest.schedule.scheduledDate
            this.sourceAccountId = user.accountId
            this.sourceUserId = user.userId
            this.destinationAccountId = chosenConsultant.accountId
            this.destinationUserId = chosenConsultant.id
            this
        }

        val checkupScheduleEntity = toCheckupScheduleEntity(
            newId,
            checkupScheduleRequest,
            chosenConsultant,
            campaigns,
            protocol
        )
        checkupScheduleEntity.scheduleNumber = createScheduleNumber()
        assignIdsToCustomerAndTower(checkupScheduleEntity, checkupScheduleRequest.vehicleSchedule.vehicle.assetId, user)

        val schedule = scheduleServiceImpl.createSchedule(scheduleInput)
        schedule.sourceUserName = getManagerName(user.userId, chosenConsultant)
        checkupScheduleEntity.schedule = CheckupScheduleConverter.scheduleToScheduleEntityForCheckupSchedule(schedule)

        val checkupScheduleEntityNew = checkupScheduleRepository.createCheckupSchedule(checkupScheduleEntity)
        pushNotification.execute(NotificationWrapperConverter.fromSchedule(newId.toString(), protocol, schedule.sourceUserId, schedule.destinationUserId))
        val checkup = checkupScheduleEntityNew.checkup?.let {
            Checkup().apply {
                range = CheckupRange().apply {
                    start = it.value
                    maintenanceGroupId = it.maintenanceGroupId
                }
            }
        }

        occurrenceMaintenanceManagerProducer.sendMessageToCreateMaintenance(newId.toString())

        return with(toCheckupScheduleOnCreate(checkupScheduleEntityNew, checkup)) {
            consultant = chosenConsultant
            this.campaigns = campaigns
            this
        }
    }

    private fun toCheckupScheduleEntity(
        newCheckupScheduleId: UUID,
        checkupScheduleRequest: CheckupScheduleRequest,
        chosenConsultant: Consultant,
        campaignModelList: List<Campaign>,
        protocol: String,
    ): CheckupScheduleEntity {
        return with(Mapping.copy(checkupScheduleRequest, CheckupScheduleEntity())) {
            id = newCheckupScheduleId
            this.waitFor = chooseWaitFor(checkupScheduleRequest.createdBy, checkupScheduleRequest.towerUserId).name
            this.campaigns = campaignModelList.map {
                Mapping.copy(it, CampaignScheduleChild())
            }
            vehicleSchedule = with(CheckupScheduleConverter.vehicleScheduleRequestToEntity(checkupScheduleRequest.vehicleSchedule)) {
                this.dealership = getDealership(chosenConsultant.dn)
                this
            }
            this.checkup = checkupScheduleRequest.checkup?.let {
                CheckupChildEntity().apply {
                    this.value = it.value
                    maintenanceGroupId = it.maintenanceGroupId
                    type = it.type
                    hasCampaigns = it.hasCampaigns
                }
            }
            this.protocol = protocol
            this.consultant = ConsultantConverter.consultantToEntity(chosenConsultant)
            this.towerUserId = checkupScheduleRequest.towerUserId
            this.createdBy = checkupScheduleRequest.createdBy.name
            this.scheduledBy = checkupScheduleRequest.scheduledBy
            this.createdByUserProfileId = checkupScheduleRequest.createdByUserProfileId
            this.dealershipId = chosenConsultant.dn
            this
        }
    }

    private fun getDealership(dealershipId: String): DealershipChild {
        val dealership = dealershipServiceImpl.dealershipById(dealershipId)
        return Mapping.copy(dealership, DealershipChild())
    }

    fun chooseWaitFor(createdByType: InviterType, towerUserId:String?): InviterType {
        return when(createdByType) {
            InviterType.MANAGER -> InviterType.CONSULTANT
            InviterType.CONSULTANT -> if (towerUserId != null) InviterType.TOWER else InviterType.MANAGER
            InviterType.TOWER -> InviterType.CONSULTANT
            else -> throw BusinessException(ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(), "Invalid type to create checkup"))
        }
    }

    private fun assignIdsToCustomerAndTower(
        checkupScheduleEntity: CheckupScheduleEntity,
        assetId: String,
        user: UserAuthenticate,
    ) {
        val currentAsset = assetsDbService.getAssetByAccountIdAndAssetId(
            user.accountId,
            assetId
        )
        val chassis = currentAsset.identification
        checkupScheduleEntity.chassis = chassis
        checkupScheduleEntity.vehicleSchedule.vehicle.chassis = chassis
        if(controlTowerAccountId == user.accountId) {
            checkupScheduleEntity.towerAccountId = currentAsset.accountId
            checkupScheduleEntity.towerAssetId = currentAsset.id
            if (chassis != null) {
                val customerAsset = assetsDbService.getCustomerAsset(
                    chassis,
                    currentAsset.accountId,
                )
                if(customerAsset != null) {
                    checkupScheduleEntity.assetId = customerAsset.id
                    checkupScheduleEntity.accountId = customerAsset.accountId
                }
            }
        } else {
            checkupScheduleEntity.assetId = currentAsset.id
            checkupScheduleEntity.accountId = currentAsset.accountId
            if(chassis != null) {
                val towerAsset = assetsDbService.getTowerAsset(chassis, controlTowerAccountId)
                if(towerAsset != null) {
                    checkupScheduleEntity.towerAccountId = controlTowerAccountId
                    checkupScheduleEntity.towerAssetId = towerAsset.id
                }
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

    private fun validateAlreadyExistsScheduleForCheckup(checkupScheduleRequest: CheckupScheduleRequest, checkupSchedules: List<CheckupScheduleEntity>) {
        for(oneCheckupSchedule in checkupSchedules) {
            val checkupScheduleFullInfo = checkupScheduleRepository.getCheckupScheduleById(oneCheckupSchedule.id.toString())
            // Verifica se o agendamento está rejeitado
            if(checkupScheduleFullInfo?.schedule?.state == ScheduleStateEnum.REJECTED.state()) {
                return
            }

            // Verifica se o type do checkup é o mesmo
            val sameCheckupType = checkupScheduleFullInfo?.checkup?.type == checkupScheduleRequest.checkup?.type

            // Verifica se o hasCampaigns é o mesmo
            val sameHasCampaigns = checkupScheduleFullInfo?.checkup?.hasCampaigns == checkupScheduleRequest.checkup?.hasCampaigns
            
            // Verifica se o scheduleDate é superior à data atual
            val scheduleDateInFuture = checkupScheduleFullInfo?.schedule?.scheduledDate?.isAfter(LocalDateTime.now()) ?: false
            
            // Se tiver o mesmo type, mesmo hasCampaigns e um scheduleDate no futuro, retorna o erro
            if(sameCheckupType && sameHasCampaigns && scheduleDateInFuture) {
                throw BusinessException(
                    ErrorCode.CHECKUP_ALREADY_SCHEDULED.toResponse()
                )
            }
        }
    }

    private fun checkupScheduleFromUser(assetId: String, user: UserAuthenticate) : List<CheckupScheduleEntity> {
        if(user.accountId == controlTowerAccountId) {
            return this.checkupScheduleRepository.getCheckupScheduleIdByTowerAssetId(assetId)
        }
        return this.checkupScheduleRepository.getCheckupScheduleIdByAssetId(assetId)
    }

    private fun getFieldAction(
        checkupScheduleRequest: CheckupScheduleRequest,
        checkupSchedules: List<CheckupScheduleEntity>
    ): List<Campaign> {
        val selectedCampaigns = validateFieldCampaigns(checkupSchedules, checkupScheduleRequest)
        return selectedCampaigns
    }

    fun validateFieldCampaigns(checkupSchedules:List<CheckupScheduleEntity>, checkupScheduleRequest: CheckupScheduleRequest) : List<Campaign> {
        val campaignsCompare = validateValidFieldCampaigns(checkupScheduleRequest)
        validateFieldCampaignsMustNotAlreadyScheduled(campaignsCompare, checkupSchedules)
        return campaignsCompare
    }

    private fun validateFieldCampaignsMustNotAlreadyScheduled(
        campaignsCompare: List<Campaign>,
        checkupSchedules: List<CheckupScheduleEntity>
    ) {
        val alreadyCampaigns = arrayListOf<String>()
        for(oneSchedule in checkupSchedules) {
            checkScheduledCampaigns(oneSchedule.campaigns, campaignsCompare, alreadyCampaigns)
        }
        if(alreadyCampaigns.isNotEmpty()) {
            val enumError = ErrorCode.SOME_FIELD_CAMPAIGNS_HAS_SCHEDULE
            throw BusinessException(
                ErrorCodeResponse(
                    enumError.code,
                    enumError.message + ". Numero de campanhas já agendadas: ${alreadyCampaigns.joinToString { it }}"
                )
            )
        }
    }

    private fun checkScheduledCampaigns(
        scheduledCampaigns: List<CampaignScheduleChild>,
        campaignsCompare: List<Campaign>,
        alreadyCampaigns: ArrayList<String>
    ) {
        for(scheduledCampaign in scheduledCampaigns) {
            for(selectedCampaigns in campaignsCompare) {
                if (scheduledCampaign.number == selectedCampaigns.number) {
                    alreadyCampaigns.add(selectedCampaigns.number)
                }
            }
        }
    }

    fun validateValidFieldCampaigns(checkupScheduleRequest: CheckupScheduleRequest) : List<Campaign> {
        if(checkupScheduleRequest.fieldCampaignNumbers.isEmpty()) {
            return arrayListOf()
        }
        val campaigns = checkupScheduleRequest.vehicleSchedule.vehicle.chassis?.let {
            fieldActionServiceImpl.pendingFieldActionListByChassis(it)
        } ?: listOf()
        val campaignsCompare = campaigns.filter { campaign ->
            checkupScheduleRequest.fieldCampaignNumbers.any {
                campaign.number == it
            }
        }
        if(campaignsCompare.size != checkupScheduleRequest.fieldCampaignNumbers.size) {
            throw BusinessException(
                ErrorCodeResponse(
                    ErrorCode.SOME_FIELD_CAMPAIGNS_NOT_EXISTS.code,
                    "${ErrorCode.SOME_FIELD_CAMPAIGNS_NOT_EXISTS.message}. Apenas os seguintes ids são válidos: ${if(campaignsCompare.isEmpty()) "Nenhum" else campaignsCompare.joinToString { it.number }}"
                )
            )
        }
        return campaignsCompare
    }

    fun toCheckupScheduleOnCreate(checkupScheduleEntity: CheckupScheduleEntity, checkup: Checkup?) : CheckupSchedule {
        val checkupSchedule = CheckupScheduleConverter.checkupScheduleEntityToModel(checkupScheduleEntity)
        return with(checkupSchedule) {
            val plansWithProducts = planServiceImpl.getPlansAndAssets()
            val plans = planServiceImpl.getPlansByAssetId(this.vehicleSchedule.vehicle.assetId, plansWithProducts)
            this.vehicleSchedule.plans = plans
            this.checkup = checkup
            this
        }
    }

    private fun validateCheckupScheduleRequest(checkupScheduleRequest: CheckupScheduleRequest) {
        if(checkupScheduleRequest.checkup == null && checkupScheduleRequest.fieldCampaignNumbers.isEmpty()) {
            throw BusinessException(ErrorCode.CHECKUP_OR_FIELD_ACTION_SHOULD_BE_PRESENT.toResponse())
        }
    }

    private fun getConsultant(checkupScheduleRequest: CheckupScheduleRequest): Consultant {
        val consultantId = checkupScheduleRequest.consultantId!!
        val dateToSchedule = checkupScheduleRequest.schedule.scheduledDate
        return consultantsServiceImpl.consultantByIdAvailable(consultantId, dateToSchedule)
    }

    private fun getSequenceDate() : String {
        val brazilZone = ZoneId.of("America/Sao_Paulo")
        val brazilTime = ZonedDateTime.now(brazilZone)
        val formatter = DateTimeFormatter.ofPattern("ddMMyyyy")
        val stringDate = brazilTime.format(formatter)
        return stringDate
    }

    private fun createScheduleNumber() : String {
        val date = getSequenceDate()
        val sequenceNumber = sequenceRepository.nextSequenceRotation(
            "checkup_schedule_seq",
            9999
        )
        val sequenceNumberFormatted = String.format("%05d", sequenceNumber)
        val sequenceCode = "AGDRIO-${date}${sequenceNumberFormatted}"
        return sequenceCode
    }

    fun adjustSchedules() {
        val checkupScheduleEntityList = checkupScheduleRepository.allCheckupSchedules()
        for(checkupScheduleEntity in checkupScheduleEntityList) {
            val schedule = checkupScheduleEntity.schedule
            val user = UserAuthenticate(
                accountId = schedule.sourceAccountId,
                userId = schedule.sourceUserId,
                sub = "",
                scope = ""
            )
            assignIdsToCustomerAndTower(
                checkupScheduleEntity = checkupScheduleEntity,
                user = user,
                assetId = checkupScheduleEntity.vehicleSchedule.vehicle.assetId
            )
            assignConsultantId(checkupScheduleEntity)
            checkupScheduleEntity.updateStateAndScheduleDate()
            adjustScheduleNumber(checkupScheduleEntity)
            checkupScheduleRepository.updateCheckupSchedule(checkupScheduleEntity)
        }
    }


    private fun adjustScheduleNumber(checkupScheduleEntity:CheckupScheduleEntity) {
        if(checkupScheduleEntity.scheduleNumber == null) {
            checkupScheduleEntity.scheduleNumber = createScheduleNumber()
        }
    }

    private fun assignConsultantId(checkupScheduleEntity: CheckupScheduleEntity) {
        if(checkupScheduleEntity.dealershipId == null) {
            checkupScheduleEntity.dealershipId = checkupScheduleEntity.consultant.dn
        }
    }

}