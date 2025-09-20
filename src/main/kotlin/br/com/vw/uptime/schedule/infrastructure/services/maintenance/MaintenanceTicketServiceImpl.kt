package br.com.vw.uptime.schedule.infrastructure.services.maintenance

import br.com.vw.uptime.schedule.core.converters.Mapping
import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.enums.maintenance.StepType
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.models.Page
import br.com.vw.uptime.schedule.core.models.alerts.Data
import br.com.vw.uptime.schedule.core.models.maintenance.Checkup
import br.com.vw.uptime.schedule.core.models.maintenance.CheckupRange
import br.com.vw.uptime.schedule.core.models.maintenance.Inspection
import br.com.vw.uptime.schedule.core.models.maintenance.ticket.MaintenanceTicketRequest
import br.com.vw.uptime.schedule.core.models.maintenance.ticket.MaintenanceTicketResponse
import br.com.vw.uptime.schedule.core.models.maintenance.ticket.TicketStatusGroup
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.requests.CheckoutRequest
import br.com.vw.uptime.schedule.entrypoint.responses.*
import br.com.vw.uptime.schedule.infrastructure.entities.checkup.CheckupScheduleEntity
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.*
import br.com.vw.uptime.schedule.infrastructure.repositories.alerts.AlertRequest
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.CheckupScheduleRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.MaintenanceRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.token.CachedTokenRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.token.OAuthRioRepository
import br.com.vw.uptime.schedule.infrastructure.services.alert.AlertServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.asset.AssetsServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.asset.VehicleStatus
import br.com.vw.uptime.schedule.infrastructure.services.user.ConsultantsServiceImpl
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.util.*

@Service
class MaintenanceTicketServiceImpl(
    val maintenanceRepository: MaintenanceRepository,
    val checkupScheduleRepository: CheckupScheduleRepository,
    val alertServiceImpl: AlertServiceImpl,
    val assetsServiceImpl: AssetsServiceImpl,
    oAuthRioRepository: OAuthRioRepository,
    val ticketToScheduleService: TicketToScheduleService,
    val consultantsServiceImpl: ConsultantsServiceImpl
) {

    private val cachedTokenRepository = CachedTokenRepository(oAuthRioRepository)

    fun createTicket(maintenanceTicketRequest: MaintenanceTicketRequest) : MaintenanceTicketResponse {
        val maintenanceSchedule = validateOpenTicket(maintenanceTicketRequest)
        val maintenanceTicketEntity = toMaintenanceTicketEntity(maintenanceTicketRequest, maintenanceSchedule)
        val maintenanceTicketEntityNew = maintenanceRepository.save(maintenanceTicketEntity)
        ticketToScheduleService.updateMaintenanceOnSchedule(
            maintenanceTicketEntityNew.status,
            maintenanceTicketEntityNew.ticket,
            maintenanceTicketEntity.maintenanceScheduleId
        )
        return with(MaintenanceTicketResponse()) {
            this.id = maintenanceTicketEntityNew.id
            this
        }
    }

    private fun validateOpenTicket(maintenanceTicketRequest: MaintenanceTicketRequest): CheckupScheduleEntity {
        validateCheckInDates(maintenanceTicketRequest)
        validateTicketAlreadyExistsForSchedule(maintenanceTicketRequest)
        return validateScheduleExists(maintenanceTicketRequest)
    }

    private fun validateCheckInDates(maintenanceTicketRequest: MaintenanceTicketRequest) {
        if(maintenanceTicketRequest.checkInDate == null) {
            missingFieldException("checkInDate")
        }
        if(maintenanceTicketRequest.checkInHour == null) {
            missingFieldException("checkInHour")
        }
    }

    fun missingFieldException(fieldName:String) {
        throw BusinessException(
            ErrorCodeResponse(
                ErrorCode.MISSING_FIELDS.code,
                "Preencha o campo '$fieldName'"
            )
        )
    }

    /**
     * The call of getScheduleById will throw Exception if the checkupSchedule does not exist
     * The schedule must exist to create maintenance ticket
     */
    private fun validateScheduleExists(maintenanceTicketRequest: MaintenanceTicketRequest): CheckupScheduleEntity {
        val maintenanceSchedule = checkupScheduleRepository.getCheckupScheduleById(
            maintenanceTicketRequest.maintenanceScheduleId
        ) ?: throw BusinessException(ErrorCode.NO_CHECKUP_SCHEDULE_FOUND.toResponse())
        return maintenanceSchedule
    }

    fun validateTicketAlreadyExistsForSchedule(maintenanceTicketRequest: MaintenanceTicketRequest) {
        val maintenanceScheduleId = maintenanceTicketRequest.maintenanceScheduleId
        val maintenanceSchedule = maintenanceRepository.findByMaintenanceScheduleId(maintenanceScheduleId)
        if(maintenanceSchedule != null) {
            throw BusinessException(
                ErrorCode.MAINTENANCE_TICKET_ALREADY_FOR_GIVEN_SCHEDULE.toResponse()
            )
        }
    }

    private fun toMaintenanceTicketEntity(request: MaintenanceTicketRequest, maintenanceSchedule: CheckupScheduleEntity): MaintenanceTicketEntity {
        return with(MaintenanceTicketEntity()) {
            val schedule = maintenanceSchedule.schedule
            val vehicle = maintenanceSchedule.vehicleSchedule.vehicle
            this.id = UUID.randomUUID().toString()
            this.status = StepType.TICKET.name
            this.scheduleDate = schedule.scheduledDate
            this.checkup = maintenanceSchedule.checkup?.let {
                CheckupTicketChildEntity().apply {
                    this.value = it.value
                    this.maintenanceGroupId = it.maintenanceGroupId
                }
            }
            this.campaigns = maintenanceSchedule.campaigns.map {
                Mapping.copy(it, FieldCampaignTicketEntity())
            }
            this.accounts = AccountsTicketEntity().apply {
                this.sourceAccountId = schedule.sourceAccountId
                this.sourceUserId = schedule.sourceUserId
                this.destinationAccountId = schedule.destinationAccountId
                this.destinationUserId = schedule.destinationUserId
            }
            this.vehicle = VehicleTicketEntity().apply {
                identification = vehicle.chassis
                model = vehicle.vehicleModel
                name = vehicle.name
            }
            val ticket = ticketChildEntity(request, maintenanceSchedule)
            this.maintenanceScheduleId = request.maintenanceScheduleId
            this.ticket = ticket
            this.chassis = maintenanceSchedule.vehicleSchedule.vehicle.chassis
            this.accountId = maintenanceSchedule.accountId
            this.dealershipId = maintenanceSchedule.dealershipId
            this.towerAccountId = maintenanceSchedule.towerAccountId
            this.updateStatusGroupAndStartDate()
            this
        }
    }

    fun ticketChildEntity(request: MaintenanceTicketRequest, maintenanceSchedule: CheckupScheduleEntity): TicketPhaseChild {
        val vehicleStatus = vehicleStatus(request, maintenanceSchedule)
        return with(TicketPhaseChild()) {
            this.checkInDate = request.checkInDate
            this.checkInHour = request.checkInHour
            this.alerts = alertChildEntityList(maintenanceSchedule)
            this.distanceToDealership = vehicleStatus?.distanceFromDealership
            this.electricFence = isInElectricFence(vehicleStatus)
            this
        }
    }

    fun finishedSteps(stepName:String):List<StepType> {
        val steps = StepType.entries.toTypedArray()
        val finishedSteps = arrayListOf<StepType>()
        for(oneStep in steps) {
            if(oneStep.name != stepName) {
                finishedSteps.add(oneStep)
            } else {
                break
            }
        }
        return finishedSteps
    }

    private fun vehicleStatus(request: MaintenanceTicketRequest, maintenanceSchedule: CheckupScheduleEntity): VehicleStatus? {
        try {
            return assetsServiceImpl.getVehicleStatusByAssetIdAndAccountId(
                maintenanceSchedule.vehicleSchedule.vehicle.assetId,
                maintenanceSchedule.schedule.destinationAccountId,
                cachedTokenRepository.getToken()
            )
        } catch (e:BusinessException) {
            if(e.errorCode.code == ErrorCode.ENTITY_NOT_FOUND.code) {
                return null
            }
            throw Exception("Vehicle Status Error")
        }
    }

    private fun isInElectricFence(vehicleStatus: VehicleStatus?): Boolean? {
        val distance = vehicleStatus?.distanceFromDealership ?: return null
        return distance <= 0.1
    }

    private fun alertChildEntityList(maintenanceSchedule: CheckupScheduleEntity): List<AlertChild> {
        val endDate = OffsetDateTime.now()
        val startDate = endDate.minusDays(1)
        val alertsList = treatAlerts(maintenanceSchedule, startDate, endDate)
        return alertsList.map { alert ->
            with(AlertChild()) {
                Mapping.copy(alert, this)
            }
        }
    }

    private fun treatAlerts(maintenanceSchedule: CheckupScheduleEntity, startDate: OffsetDateTime, endDate: OffsetDateTime): List<Data> {
        try {
            return alertServiceImpl.getAlerts(
                AlertRequest(
                    pageSize = 100,
                    page = 0,
                    assetIds = listOf(maintenanceSchedule.vehicleSchedule.vehicle.assetId),
                    tagIds = listOf(),
                    startAt = startDate.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                    endAt = endDate.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                    search = "",
                    zone = "UTC-3"
                )
            ).getData()
        } catch (ex:BusinessException) {
            if(ex.errorCode.code == "no.body")  {
                return arrayListOf()
            }
            return arrayListOf()
        }
    }

    fun getTicketDetails(ticketId:String) : MaintenanceTicketDetailResponse {
        val maintenanceTicketEntity = getOrThrowIfTicketNotExists(ticketId)
        return ticketEntityToDetails(maintenanceTicketEntity)
    }

    fun getTicketDetailsByScheduleId(maintenanceScheduleId: String): MaintenanceTicketDetailResponse {
        val maintenanceTicketEntity = maintenanceRepository.findByMaintenanceScheduleId(maintenanceScheduleId)
        if(maintenanceTicketEntity == null) {
            throw BusinessException(
                ErrorCode.TICKET_NOT_FOUND.toResponse()
            )
        }
        return ticketEntityToDetails(maintenanceTicketEntity)
    }

    fun ticketEntityToDetails(maintenanceTicketEntity:MaintenanceTicketEntity): MaintenanceTicketDetailResponse {
        return Mapping.copy(maintenanceTicketEntity, MaintenanceTicketDetailResponse()).apply {
            val vehicle = maintenanceTicketEntity.vehicle
            this.vehicle = VehicleTicketDetail(
                identification = vehicle.identification,
                model = vehicle.model,
                name = vehicle.name
            )
            this.checkup = maintenanceTicketEntity.checkup?.let { toCheckup(it) }
            this.ticket = Mapping.copy(maintenanceTicketEntity.ticket, TicketResponse()).apply {
                this.alerts = maintenanceTicketEntity.ticket.alerts.map {
                    Mapping.copy(it, AlertTicketResponse())
                }
            }
            this.screening = maintenanceTicketEntity.screening?.let { Mapping.copy(it, ScreeningResponse()) }
            this.repair = maintenanceTicketEntity.repair?.let { Mapping.copy(it, RepairResponse()) }
            this.inspection = maintenanceTicketEntity.inspection?.let { Mapping.copy(it, Inspection()) }
            this.release = maintenanceTicketEntity.release?.let { Mapping.copy(it, ReleaseTicketResponse()) }
        }
    }

    fun toCheckup(checkupTicketChildEntity: CheckupTicketChildEntity): Checkup {
        return Checkup().apply {
            this.range = CheckupRange().apply {
                this.start = checkupTicketChildEntity.value
            }
            this.maintenanceGroupId = checkupTicketChildEntity.maintenanceGroupId
        }
    }

    fun checkout(ticketId: String, checkoutRequest: CheckoutRequest) {
        val maintenanceTicketEntity = getOrThrowIfTicketNotExists(ticketId)
        maintenanceTicketEntity.ticket.checkOutDate = checkoutRequest.checkOutDate
        maintenanceTicketEntity.ticket.checkOutHour = checkoutRequest.checkOutHour
        this.maintenanceRepository.save(maintenanceTicketEntity)
        ticketToScheduleService.updateMaintenanceOnSchedule(
            maintenanceTicketEntity.status,
            maintenanceTicketEntity.ticket,
            maintenanceTicketEntity.maintenanceScheduleId
        )
    }

    private fun getOrThrowIfTicketNotExists(ticketId: String): MaintenanceTicketEntity {
        val maintenanceTicketEntity = maintenanceRepository.findById(ticketId)
        if(maintenanceTicketEntity == null) {
            throw BusinessException(
                ErrorCode.TICKET_NOT_FOUND.toResponse()
            )
        }
        return maintenanceTicketEntity
    }

    fun ticketsByConsultantUser(
        user: UserAuthenticate,
        ticketStatusGroup:TicketStatusGroup? = null,
        date: String,
        queryChassis: String?,
        limit: Int,
        sortDirection: String?,
        encodedLastKey: String?
    ) : Page<TicketItemResponse> {

        val consultant = consultantsServiceImpl.consultantById(user.userId)
        val maintenanceTicketEntityPage = if(queryChassis.isNullOrBlank()) {
            maintenanceRepository.getAllByConsultantUser(
                dealershipId = consultant.dn,
                ticketStatusGroup = ticketStatusGroup,
                checkInDateTicket = date.let { if (it == "") null else LocalDate.parse(it) },
                sortDirection = sortDirection,
                limit = limit,
                encodedLastKey = encodedLastKey
            )
        } else {
            Page(
                items = maintenanceRepository.findMaintenanceTicketByChassis(queryChassis),
                lastKey = null
            )
        }
        return Page(
            items = maintenanceTicketEntityPage.items.map { toTicketItemResponse(it) },
            lastKey = maintenanceTicketEntityPage.lastKey
        )
    }

    fun adjustMaintenanceTickets() {
        val tickets = maintenanceRepository.getAllMaintenanceTickets()
        for(oneTicket in tickets) {
            val schedule = checkupScheduleRepository.getCheckupScheduleById(oneTicket.maintenanceScheduleId)!!
            oneTicket.apply {
                this.accountId = schedule.accountId
                this.dealershipId = schedule.dealershipId
                this.towerAccountId = schedule.towerAccountId
                this.updateStatusGroupAndStartDate()
            }
            maintenanceRepository.save(oneTicket)
        }
    }

    fun ticketsByAccountId(
        user: UserAuthenticate,
        ticketStatusGroup: TicketStatusGroup? = null,
        date: String,
        queryChassis: String?,
        limit: Int,
        sortDirection: String?,
        encodedLastKey: String?
    ) : Page<TicketItemResponse> {

        val maintenanceTicketEntityPage = if(queryChassis.isNullOrBlank()) {
            maintenanceRepository.getAllByAccountId(
                accountId = user.accountId,
                ticketStatusGroup = ticketStatusGroup,
                checkInDateTicket = date.let { if (it == "") null else LocalDate.parse(it) },
                sortDirection = sortDirection,
                limit = limit,
                encodedLastKey = encodedLastKey
            )
        } else {
            Page(
                items = maintenanceRepository.findMaintenanceTicketByChassis(queryChassis),
                lastKey = null
            )
        }
        return Page(
            items = maintenanceTicketEntityPage.items.map { toTicketItemResponse(it) },
            lastKey = maintenanceTicketEntityPage.lastKey
        )
    }

    fun getAllTickets(
        page: Int,
        limit: Int,
        sortDirection: String?,
        queryChassis: String?,
        date: String?
    ): List<TicketItemResponse> {
        val assets = assetsServiceImpl.getAssetsAll()
        val chassisList = assets.mapNotNull { it.getIdentification() }
            .filter { queryChassis == null || it.contains(queryChassis, ignoreCase = true) }
            .toList()

        val tickets = if (date != "") {
            chassisList.chunked(50)
                .flatMap { chunk ->
                    maintenanceRepository.getAllByChassisList(chunk).map {
                        toTicketItemResponse(it)
                    }
                }
                .filter { ticket -> ticket.scheduleDate.toLocalDate().toString() == date }
        } else {
            chassisList.chunked(50)
                .flatMap { chunk ->
                    maintenanceRepository.getAllByChassisList(chunk).map {
                        toTicketItemResponse(it)
                    }
                }
        }
            .let { filteredTickets: List<TicketItemResponse> ->
                if (sortDirection?.equals("desc", ignoreCase = true) == true) {
                    filteredTickets.sortedByDescending { ticket -> ticket.scheduleDate }
                } else {
                    filteredTickets.sortedBy { ticket -> ticket.scheduleDate }
                }
            }

        if (tickets.isEmpty() || (page - 1) * limit >= tickets.size) {
            return emptyList()
        }

        return tickets.stream()
            .skip((page - 1) * limit.toLong())
            .limit(limit.toLong())
            .toList()
    }

    fun getTicketsByChassisList(chassisList: Set<String>): List<TicketItemResponse> {
        return chassisList.stream()
            .map { chassis ->  maintenanceRepository.findMaintenanceTicketByChassis(chassis) }
            .flatMap { listOfChassis -> listOfChassis.stream().map{s ->  toTicketItemResponse(s) } }
            .toList()
    }


    fun toTicketItemResponse(maintenanceTicketEntity: MaintenanceTicketEntity): TicketItemResponse {
        val step = when(maintenanceTicketEntity.status) {
            StepType.TICKET.name -> Mapping.copy(maintenanceTicketEntity.ticket, TicketResponse()).apply { alerts = arrayListOf() }
            StepType.SCREENING.name -> Mapping.copy(maintenanceTicketEntity.screening!!, ScreeningResponse())
            StepType.REPAIR.name -> Mapping.copy(maintenanceTicketEntity.repair!!, RepairResponse())
            StepType.INSPECTION.name -> Mapping.copy(maintenanceTicketEntity.inspection!!, Inspection())
            StepType.FINISHED.name, StepType.RELEASE.name -> Mapping.copy(maintenanceTicketEntity.release!!, ReleaseTicketResponse())

            else -> throw BusinessException(
                ErrorCodeResponse(
                    HttpStatus.UNPROCESSABLE_ENTITY.value().toString(),
                    "O {step} não possui um valor válido")
            )
        }
        return TicketItemResponse(
            id = maintenanceTicketEntity.id,
            status = maintenanceTicketEntity.status,
            criticality = maintenanceTicketEntity.screening?.criticality,
            maintenanceScheduleId = maintenanceTicketEntity.maintenanceScheduleId,
            scheduleDate = maintenanceTicketEntity.scheduleDate,
            vehicle = Vehicle(
                identification = maintenanceTicketEntity.vehicle.identification,
                model = maintenanceTicketEntity.vehicle.model,
                name = maintenanceTicketEntity.vehicle.name
            ),
            checkup = maintenanceTicketEntity.checkup?.let {
                CheckupTicket(
                    CheckupRange().apply {
                        this.start = it.value
                    }
                )
            },
            campaigns = maintenanceTicketEntity.campaigns.map {
                FieldCampaignTicket(
                    number = it.number,
                    name = it.name
                )
            },
            finishedSteps = finishedSteps(maintenanceTicketEntity.status).map { it.name },
            step = step,
            hasReview = maintenanceTicketEntity.hasReview
        )
    }
}

data class TicketItemResponse(
    val id: String,
    val status: String,
    val criticality:Int?,
    val maintenanceScheduleId: String,
    val scheduleDate:LocalDateTime,
    val finishedSteps:List<String>,
    val vehicle: Vehicle,
    val checkup: CheckupTicket?,
    val campaigns:List<FieldCampaignTicket>,
    val step: Any,
    val hasReview: Boolean
)

data class Vehicle(
    val identification: String?,
    val model:String?,
    val name:String?
)

class CheckupTicket (
    val range: CheckupRange,
)

data class FieldCampaignTicket(
    val name: String,
    val number: String
)