package br.com.vw.uptime.schedule.infrastructure.services.assistance

import br.com.vw.uptime.schedule.core.converters.AssistanceConverter
import br.com.vw.uptime.schedule.core.enums.assistance.AssistanceDispatchStepType
import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.enums.schedule.InviterType
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.models.Page
import br.com.vw.uptime.schedule.core.models.assistance.*
import br.com.vw.uptime.schedule.core.models.assistance.enums.AssistanceHistoryState
import br.com.vw.uptime.schedule.core.models.assistance.enums.AssistanceOccurrenceType
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.requests.assistance.*
import br.com.vw.uptime.schedule.entrypoint.responses.assistance.DispatchStepResponse
import br.com.vw.uptime.schedule.infrastructure.entities.assistance.*
import br.com.vw.uptime.schedule.infrastructure.repositories.assistance.AssistanceRepository
import br.com.vw.uptime.schedule.infrastructure.services.asset.AssetsDbService
import br.com.vw.uptime.schedule.infrastructure.services.asset.AssetsServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.dealership.DealershipServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.user.Consultant
import br.com.vw.uptime.schedule.infrastructure.services.user.ConsultantsServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.user.UserRoleService
import org.apache.commons.lang3.StringUtils
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*
import kotlin.random.Random

@Service
class AssistanceService(
    val assistanceRepository: AssistanceRepository,
    val dealershipServiceImpl: DealershipServiceImpl,
    val userAuthServiceImpl: UserAuthServiceImpl,
    val userRoleService: UserRoleService,
    val consultantsServiceImpl: ConsultantsServiceImpl,
    val assetsServiceImpl: AssetsServiceImpl,
    val assetsDbService: AssetsDbService
) {

    @Value("\${tower-account-id}")
    lateinit var towerAccountId:String

    fun createAssistance(assistanceCreationRequest: AssistanceCreationRequest): AssistanceResponse {
        validateAssistanceCreation(assistanceCreationRequest)
        val dealership = assistanceCreationRequest.dispatch?.let {
            dealershipServiceImpl.dealershipById(it.dealershipId!!)
        }
        val assistanceEntity = AssistanceConverter.fromRequestToEntity(assistanceCreationRequest, dealership, createRefundEntity(), createDefaultDispatchSteps())
        val user = userAuthServiceImpl.usr()
        assignNewValuesToAssistance(assistanceEntity)
        assignAccountIds(assistanceEntity, assistanceCreationRequest.assetId!!,user)
        putHistory(
            assistanceEntity,
            logDateTime = assistanceEntity.createdAt,
            user = user,
            state = AssistanceHistoryState.CREATED_ASSISTANCE
        )
        val newAssistanceEntity = assistanceRepository.save(assistanceEntity)
        return AssistanceConverter.fromEntityToAssistanceResponse(newAssistanceEntity)
    }

    private fun assignAccountIds(assistanceEntity: AssistanceEntity, tAssetId:String, usr: UserAuthenticate) {
        val towerAsset = assetsDbService.getAssetByAccountIdAndAssetId(
            accountId = usr.accountId,
            assetId = tAssetId
        )
        val chassis = towerAsset.identification
        if(chassis != null) {
            assistanceEntity.chassis = chassis
            val asset = assetsDbService.getCustomerAsset(chassis, towerAccountId)
            if(asset == null) {
                throw Exception("Asset do cliente não encontrado pelo chassi fornecido")
            }
            assistanceEntity.accountId = asset.accountId
            assistanceEntity.assetId = asset.id
        }
        assistanceEntity.towerAccountId = towerAccountId
        assistanceEntity.towerAssetId = tAssetId
    }

    fun updateAssistance(assistanceId:String, assistanceUpdateRequest: AssistanceUpdateRequest): AssistanceResponse {
        val assistanceEntity = validateAssistanceUpdate(assistanceId, assistanceUpdateRequest)
        AssistanceConverter.fromRequestUpdateToEntity(assistanceUpdateRequest, assistanceEntity)
        val user = userAuthServiceImpl.usr()
        putHistory(
            assistanceEntity,
            state = AssistanceHistoryState.UPDATE_ASSISTANCE,
            logDateTime = LocalDateTime.now(),
            user = user
        )
        val assistanceUpdatedEntity = assistanceRepository.save(assistanceEntity)
        return AssistanceConverter.fromEntityToAssistanceResponse(assistanceUpdatedEntity)
    }

    fun listAssistanceListByChassisList(
        page:Int,
        limit:Int,
        sortDirection: String?,
        queryChassis: String?,
        date: String?
    ): List<AssistanceListItem> {

        val assets = assetsServiceImpl.getAssetsAll()
        val chassisList = assets.mapNotNull { it.getIdentification() }
            .filter { queryChassis == null || it.contains(queryChassis, ignoreCase = true) }
            .toList()

        val assistanceList = if (date != "") {
            chassisList.chunked(50)
                .flatMap { chunk ->
                    assistanceRepository.getAssistanceByChassisList(chunk).map {
                        mapAssistanceEntityToListItem(it)
                    }
                }
                .filter { assistance -> assistance.createAt.toLocalDate().toString() == date }
        } else {
            chassisList.chunked(50)
                .flatMap { chunk ->
                    assistanceRepository.getAssistanceByChassisList(chunk).map {
                        mapAssistanceEntityToListItem(it)
                    }
                }
        }
            .let { filteredSchedules: List<AssistanceListItem> ->
                if (sortDirection?.equals("desc", ignoreCase = true) == true) {
                    filteredSchedules.sortedByDescending { assistance -> assistance.createAt }
                } else {
                    filteredSchedules.sortedBy { assistance -> assistance.createAt }
                }
            }

        if (assistanceList.isEmpty() || (page - 1) * limit >= assistanceList.size) {
            return emptyList()
        }

        return assistanceList.stream()
            .skip((page - 1) * limit.toLong())
            .limit(limit.toLong())
            .toList()
    }

    fun listAssistance(
        lastKey:String?,
        limit:Int,
        sortDirection: String?,
        queryChassis: String?,
        date: String?,
        state:AssistanceStateEnum
    ): Page<AssistanceListItem> {
        val page = if(!queryChassis.isNullOrBlank()) {
                assistanceRepository.getAssistanceByChassis(queryChassis, limit, lastKey)
            } else if(!date.isNullOrBlank()) {
                assistanceRepository.getAssistanceListByStateAndDate(
                    state,
                    LocalDate.parse(date),
                    limit,
                    lastKey,
                    sortDirection
                )
            } else {
                assistanceRepository.getAssistanceListByState(
                    state,
                    limit,
                    lastKey,
                    sortDirection
                )
            }
        return Page(
            items = page.items.map { mapAssistanceEntityToListItem(it) },
            lastKey = page.lastKey
        )
    }

    fun getOccurrenceTypeAssistanceList(
        state: AssistanceStateEnum?,
        date: String?,
        limit: Int,
        encodedLastKey: String?,
        sortDirection: String?
    ): Page<AssistanceListItem> {
        val page = assistanceRepository.getAssistanceListByOccurrenceType(
            AssistanceOccurrenceType.ASSISTANCE,
            state,
            if(date.isNullOrBlank()) null else LocalDate.parse(date),
            limit,
            encodedLastKey,
            sortDirection
        )
        return Page(
            items = page.items.map { mapAssistanceEntityToListItem(it) },
            lastKey = page.lastKey
        )
    }

    fun getOccurrenceTypeWinchList(
        state: AssistanceStateEnum?,
        date: String?,
        limit: Int,
        encodedLastKey: String?,
        sortDirection: String?
    ): Page<AssistanceListItem> {
        val page = assistanceRepository.getAssistanceListByOccurrenceType(
            AssistanceOccurrenceType.WINCH,
            state,
            if(date.isNullOrBlank()) null else LocalDate.parse(date),
            limit,
            encodedLastKey,
            sortDirection
        )
        return Page(
            items = page.items.map { mapAssistanceEntityToListItem(it) },
            lastKey = page.lastKey
        )
    }

    fun getAssistanceById(assistanceId: String): AssistanceResponse {
        return getAssistanceEntityOrThrow(assistanceId).let { AssistanceConverter.fromEntityToAssistanceResponse(it) }
    }

    fun assignDispatch(assistanceId: String, assignDispatchRequest: AssistanceDispatchRequest): AssistanceResponse {
        val assistanceEntity = getAssistanceEntityOrThrow(assistanceId)
        if(assistanceEntity.dispatch != null) {
            throw BusinessException(
                ErrorCode.DISPATCH_ALREADY_EXISTS.toResponse()
            )
        }
        val newDispatch = assignDispatchValidated(assignDispatchRequest).apply {
            createdAt = LocalDateTime.now()
            steps = createDefaultDispatchSteps()
        }
        assistanceEntity.dispatch = newDispatch
        assistanceEntity.apply {
            this.history += createHistoryEntity(
                state = AssistanceHistoryState.ASSIGNED_DISPATCH.name,
                logDateTime = newDispatch.createdAt!!,
                usr = userAuthServiceImpl.usr()
            )
        }
        val newAssistanceResponse = assistanceRepository.save(assistanceEntity)
        return AssistanceConverter.fromEntityToAssistanceResponse(newAssistanceResponse)
    }

    fun putHistory(assistanceEntity: AssistanceEntity, state:AssistanceHistoryState, logDateTime: LocalDateTime, user:UserAuthenticate) {
        assistanceEntity.history += createHistoryEntity(
            state = state.name,
            logDateTime = logDateTime,
            usr = user
        )
    }

    fun getAssistanceHistory(assistanceId: String) : List<AssistanceHistoryResponse> {
        val assistanceEntity = getAssistanceEntityOrThrow(assistanceId)
        return assistanceEntity.history.map {
            AssistanceConverter.historyEntityToResponse(it).apply {
                this.stateDescription = AssistanceHistoryState.valueOf(it.state).description
            }
        }
    }

    fun cancel(assistanceId: String, cancelRequest: AssistanceDispatchCancelRequest) {
        val assistanceEntity = getAssistanceEntityOrThrow(assistanceId)
        val currentDispatch = assistanceEntity.dispatch
            ?: throw BusinessException(
                ErrorCode.NO_DISPATCH_FOR_ASSISTANCE.toResponse()
            )
        assistanceEntity.canceledDispatches += currentDispatch.apply {
            this.canceledAt = LocalDateTime.now()
            this.reason = cancelRequest.reason
            this.justification = cancelRequest.justification
        }
        assistanceEntity.dispatch = null
        assistanceEntity.apply {
            this.history += createHistoryEntity(
                state = AssistanceHistoryState.CANCELED_DISPATCH.name,
                logDateTime = currentDispatch.canceledAt!!,
                usr = userAuthServiceImpl.usr()
            )
        }
        assistanceRepository.save(assistanceEntity)
    }

    private fun createHistoryEntity(
        state:String,
        logDateTime: LocalDateTime,
        usr:UserAuthenticate
    ) : AssistanceHistoryEntity {
        val consultant = getDealershipIdByLoggedUserForHistory(usr)
        return AssistanceHistoryEntity().apply {
            this.state = state
            this.date = logDateTime
            this.userHistory = UserHistoryEntity().apply {
                this.accountId = usr.accountId
                this.userId = usr.userId
                this.isTower = consultant == null
                this.dealershipId = consultant?.dn
                this.dealershipName = getDealershipName(consultant?.dn)
            }
        }
    }

    private fun getDealershipName(dealershipId: String?): String {
        if(dealershipId == null) {
            return "Torre de controle"
        }
        return dealershipServiceImpl.dealershipById(dealershipId).fantasyName
    }

    private fun getDealershipIdByLoggedUserForHistory(usr:UserAuthenticate) : Consultant? {
        val userRole = userRoleService.getRoleByUserId(usr)
        if(userRole.role == InviterType.CONSULTANT.name) {
            return consultantsServiceImpl.consultantById(usr.userId)
        }
        if(userRole.role == InviterType.TOWER.name) {
            return null
        }
        throw Exception("User for history, must be consultant or control tower user")
    }

    private fun assignDispatchValidated(assignDispatchRequest: AssistanceDispatchRequest): AssistanceDispatchEntity {
        val dealership = dealershipServiceImpl.dealershipById(assignDispatchRequest.dealershipId!!)
        val dispatchEntity = AssistanceConverter.dispatchRequestToEntity(assignDispatchRequest, dealership, createRefundEntity(), createDefaultDispatchSteps())
        return dispatchEntity
    }

    private fun createRefundEntity(): AssistanceRefundEntity {
        val protocolNumber = Random.nextLong(1000002, 9123456)
        return AssistanceRefundEntity().apply {
            this.protocolNumber = protocolNumber.toString()
            this.paidBy = "ChameVolks"
            this.releasePayment = true
            this.customer = "Volks"
        }
    }

    fun finishAssistance(assistanceId:String) {
        val assistanceEntity = getAssistanceEntityOrThrow(assistanceId)
        assistanceEntity.state = AssistanceStateEnum.FN.name
        assistanceEntity.finishedAt = LocalDateTime.now()
        assistanceRepository.save(assistanceEntity)
    }

    fun getAssistanceEntityOrThrow(assistanceId: String): AssistanceEntity {
        return assistanceRepository.getAssistanceById(assistanceId)
            ?: throw BusinessException(
                ErrorCodeResponse(HttpStatus.NOT_FOUND.value().toString(), "Não foi encontrado nenhum socorro mecânico com o id $assistanceId"))
    }

    fun mapAssistanceEntityToListItem(assistanceEntity: AssistanceEntity): AssistanceListItem {
        return AssistanceListItem().apply {
            this.id = assistanceEntity.id
            this.chassis = assistanceEntity.chassis!!
            this.createAt = assistanceEntity.createdAt
            this.finishedAt = assistanceEntity.finishedAt
            this.state = assistanceEntity.state
            this.occurType = assistanceEntity.occurType
            this.vehicle = AssistanceVehicleItem().apply {
                val vehicleEntity = assistanceEntity.vehicle!!
                this.model = vehicleEntity.vehicleModel
                this.plate = vehicleEntity.vehiclePlate
            }
            assistanceEntity.driver?.let {
                this.driver = DriverItem().apply {
                    this.name = it.name
                }
            }
            val dispatchEntity = assistanceEntity.dispatch
            if(dispatchEntity !=  null) {
                this.dispatch = DispatchItem().apply {
                    dispatchEntity.vehicleLocation?.let {
                        this.vehicleLocation = VehicleLocationItem().apply {
                            this.street = it.street
                            this.neighbourhood = it.neighbourhood
                            this.city = it.city
                            this.state = it.state
                            this.latitude = it.latitude
                            this.longitude = it.longitude
                        }
                    }
                    dispatchEntity.dealership?.let {
                        this.dealership = DealershipItem().apply {
                            this.fantasyName = it.fantasyName!!
                        }
                    }
                }
            }
        }
    }

    private fun validateAssistanceCreation(assistanceCreationRequest: AssistanceCreationRequest) {
        checkAssistanceState(assistanceCreationRequest)
    }

    private fun validateAssistanceUpdate(assistanceId:String, assistanceUpdateRequest: AssistanceUpdateRequest): AssistanceEntity {
        val assistanceEntity = getAssistanceEntityOrThrow(assistanceId)
        return assistanceEntity
    }

    private fun checkAssistanceState(assistanceCreationRequest: AssistanceCreationRequest) {
        val assistanceEntity = assistanceRepository.getAssistanceByAssetActive(assistanceCreationRequest.assetId!!)
        if(assistanceEntity != null) {
            throw BusinessException(
                ErrorCode.ASSISTANCE_IN_PROGRESS_ALREADY_EXISTS.toResponse()
            )
        }
    }

    private fun assignNewValuesToAssistance(assistanceEntity: AssistanceEntity): AssistanceEntity {
        val state = AssistanceStateEnum.PD.name
        val createdAt = LocalDateTime.now()
        assistanceEntity.id = UUID.randomUUID().toString()
        assistanceEntity.createdAt = createdAt
        assistanceEntity.state = state
        val user = userAuthServiceImpl.usr()
        assistanceEntity.createdBy = UserEntity().apply {
            this.userId = user.userId
            this.accountId = user.accountId
        }
        return assistanceEntity
    }

    fun createDispatchStep(assistanceUuid: String, dispatchStepRequest: DispatchStepRequest) : DispatchStepResponse {
        val uuid = UUID.randomUUID().toString()
        getAssistanceEntityOrThrow(assistanceUuid).let { assistanceEntity ->
            assistanceEntity.dispatch?.let { dispatch ->
                val steps = dispatch.steps?.toMutableList() ?: mutableListOf()
                if (StringUtils.stripToNull(dispatchStepRequest.name) == null || (dispatchStepRequest.indexAt == null || dispatchStepRequest.indexAt !in 0..steps.size)) {
                    throw BusinessException(ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(), "Não foi possível criar uma nova etapa!"))
                }

                steps.add(dispatchStepRequest.indexAt, DispatchStepEntity().apply {
                    this.id = uuid
                    this.name = dispatchStepRequest.name!!
                    this.isDefault = false
                })

                dispatch.steps = steps
            } ?: throw BusinessException(ErrorCodeResponse(HttpStatus.NOT_FOUND.value().toString(), "Acionamento não localizado!"))
            assistanceRepository.save(assistanceEntity)
        }
        return DispatchStepResponse(uuid, dispatchStepRequest.name)
    }

    fun updateDispatchStep(assistanceUuid: String, stepUuid: String, dispatchStepRequest: DispatchStepRequest) {
        getAssistanceEntityOrThrow(assistanceUuid).let { assistanceEntity ->
            assistanceEntity.dispatch?.let { dispatch ->
                dispatch.steps
                    ?.find { step -> step.id ==  stepUuid }
                    ?.let { step ->
                            with(step){
                                this.done = dispatchStepRequest.done ?: this.done
                                this.updateAt = dispatchStepRequest.updateAt ?: this.updateAt
                                this.assignedTo = dispatchStepRequest.assignedTo ?: this.assignedTo
                            }
                    } ?: throw BusinessException(ErrorCodeResponse(HttpStatus.NOT_FOUND.value().toString(), "Etapa não localizada!"))
            }
            assistanceRepository.save(assistanceEntity)
        }
    }

    fun deleteDispatchStep(assistanceUuid: String, stepUuid: String) {
        getAssistanceEntityOrThrow(assistanceUuid).let { assistanceEntity ->
            assistanceEntity.dispatch?.apply {
                this.steps = removeStep(this.steps, stepUuid)
            }
            assistanceRepository.save(assistanceEntity)
        }
    }

    private fun removeStep(steps: List<DispatchStepEntity>?, stepId:String) : List<DispatchStepEntity> {
        val step = steps?.find { dispatchStepEntity -> dispatchStepEntity.id == stepId } ?: throw BusinessException(ErrorCodeResponse(HttpStatus.NOT_FOUND.value().toString(), "Etapa não localizada!"))
        if(!step.isDefault) {
            return steps.dropWhile { dispatchStepEntity -> dispatchStepEntity.id == stepId }
        }
        throw BusinessException(ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(), "Não é possível remover uma etapa padrão do acionamento!"))
    }

    private fun createDefaultDispatchSteps(): List<DispatchStepEntity> {
        return AssistanceDispatchStepType.entries.map { step -> DispatchStepEntity().apply {
                this.id = UUID.randomUUID().toString()
                this.name = step.description
                this.isDefault = true
            }
        }.toCollection(ArrayList())
    }
}

enum class AssistanceStateEnum(
    val description:String
) {
    PD("Pendente"),
    FN("Finished")
}

