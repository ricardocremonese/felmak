package br.com.vw.uptime.schedule.infrastructure.services.occurence

import br.com.vw.uptime.schedule.core.enums.PersonaType
import br.com.vw.uptime.schedule.core.enums.occurrence.DispatchStatus
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.utils.TimeUtils
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.controllers.OccurrenceRequestList
import br.com.vw.uptime.schedule.entrypoint.controllers.OccurrenceRequestListWithScheduleIds
import br.com.vw.uptime.schedule.entrypoint.controllers.OccurrenceFilterType
import br.com.vw.uptime.schedule.entrypoint.requests.occurrence.AssignDriverToDispatchRequest
import br.com.vw.uptime.schedule.entrypoint.requests.occurrence.CancelDispatchRequest
import br.com.vw.uptime.schedule.entrypoint.requests.occurrence.CreateDispatchRequest
import br.com.vw.uptime.schedule.entrypoint.requests.occurrence.OccurrenceReviewRequest
import br.com.vw.uptime.schedule.entrypoint.responses.occurrence.*
import br.com.vw.uptime.schedule.entrypoint.responses.occurrence.ServiceBayResponse
import br.com.vw.uptime.schedule.entrypoint.responses.occurrence.ServiceBayScheduleResponse
import br.com.vw.uptime.schedule.entrypoint.responses.occurrence.OccurrencePaginatedResponse
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.*
import br.com.vw.uptime.schedule.infrastructure.mappers.OccurrenceMapper
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.CheckupScheduleRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.DispatchRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.OccurrenceRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.OccurrenceReviewRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.schedule.ScheduleRepository
import br.com.vw.uptime.schedule.infrastructure.services.user.ConsultantsServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.user.UserRoleService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

@Service
class OccurrenceService (
    private val occurrenceRepository: OccurrenceRepository,
    private val consultantsServiceImpl: ConsultantsServiceImpl,
    private val occurrenceReviewRepository: OccurrenceReviewRepository,
    private val dispatchRepository: DispatchRepository,
    private val scheduleRepository: ScheduleRepository,
    private val checkupScheduleRepository: CheckupScheduleRepository,
    private val occurrenceMapper: OccurrenceMapper){

    companion object {
        private val log = LoggerFactory.getLogger(OccurrenceService::class.java)
    }

    private val notFoundMessage = "Ocorrência não encontrada"
    private val dispatchNotFoundMessage = "Acionamento não encontrado"

    @Value("\${tower-account-id}")
    lateinit var towerAccountId:String

    @Transactional(readOnly = true)
    fun getOccurrence(uuid: String): OccurrenceEntity {
        try {
            val occurrenceEntity = occurrenceRepository.getOccurrenceByUuid(uuid)
            if (occurrenceEntity == null) {
                throw BusinessException(ErrorCodeResponse(HttpStatus.NOT_FOUND.value().toString(), notFoundMessage))
            }
            return occurrenceEntity
        } catch (e: Exception) {
            throw BusinessException(ErrorCodeResponse(HttpStatus.NOT_FOUND.value().toString(), notFoundMessage))
        }
    }

    @Transactional(readOnly = true)
    fun getOccurrenceByFilters(
        persona: PersonaType,
        page: Int,
        size: Int,
        authenticatedUser: UserAuthenticate,
        criticality: Int?,
        createdStartAt: LocalDate?,
        createdEndAt: LocalDate?,
        updatedStartAt: LocalDate?,
        updatedEndAt: LocalDate?,
        occurrenceType: List<OccurrenceType>?,
        createdByUuid: String?,
        dealershipDn: List<String>?,
        hasCampaigns: Boolean?,
        isAlert:Boolean,
        occurrenceRequestList: OccurrenceRequestList,
        filterType: OccurrenceFilterType,
        stepType: StepTypeOccurrence?
    ) : OccurrencePaginatedResponse{

        if(validateDateCriteria(createdStartAt, createdEndAt) || validateDateCriteria(updatedStartAt, updatedEndAt))
            throw BusinessException(ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(), "Você deve fornece data e início e fim"))

        val offset = page * size
        val dn = if (persona == PersonaType.CONSULTANT) consultantsServiceImpl.consultantById(authenticatedUser.userId).dn else null
        val accountId = UserRoleService.getAccountByPersona(persona, authenticatedUser, towerAccountId)
        val partnerId = UserRoleService.getPartnerId(persona, authenticatedUser)

        log.info("Getting occurrences and schedules with filters size: [{}], offset: [{}], accountId: [{}], chassis: [{}], occurrenceType: [{}], criticality: [{}], partnerId: [{}], createdStartAt: [{}], createdEndAt: [{}], updatedStartAt: [{}], updatedStartAt: [{}], dn [{}], dealershipDn [{}], stepType [{}]",
            size, offset, accountId, occurrenceRequestList.chassisList, occurrenceType, criticality, partnerId, createdStartAt, createdEndAt, updatedStartAt, updatedEndAt, dn, dealershipDn, stepType?.name)

        val occurrenceTypeString = occurrenceType?.joinToString(",") { it.type }
        
        val dealershipDnList = dealershipDn ?: emptyList()
        val dealershipDnEmpty = dealershipDn.isNullOrEmpty()

        val finishedParam = when (filterType) {
            OccurrenceFilterType.ALL -> null
            OccurrenceFilterType.FINISHED -> true
            OccurrenceFilterType.OPEN -> false
        }

        val totalOccurrences = occurrenceRepository.countOccurrences(
            accountId, occurrenceRequestList.chassisList, occurrenceRequestList.chassisList.isEmpty(), occurrenceTypeString, criticality, partnerId, createdStartAt, createdEndAt, updatedStartAt, updatedEndAt, dn, createdByUuid, dealershipDnList, dealershipDnEmpty, hasCampaigns, finishedParam, stepType?.name
        )
        
        val inProgressOccurrenceStats = occurrenceRepository.getInProgressOccurrencesStats(
            accountId, occurrenceRequestList.chassisList, occurrenceRequestList.chassisList.isEmpty(), occurrenceTypeString, criticality, partnerId, createdStartAt, createdEndAt, updatedStartAt, updatedEndAt, dn, createdByUuid, dealershipDnList, dealershipDnEmpty, hasCampaigns, finishedParam, stepType?.name
        )

        val totalMinutes = inProgressOccurrenceStats.getTotalMinutes()
        val totalPages = if (totalOccurrences > 0) ((totalOccurrences - 1) / size).toInt() + 1 else 0
        
        val occurrences = occurrenceRepository.listOccurrencesWithFilter(
            size,
            offset,
            accountId,
            occurrenceRequestList.chassisList,
            occurrenceRequestList.chassisList.isEmpty(),
            occurrenceTypeString,
            criticality,
            partnerId,
            createdStartAt,
            createdEndAt,
            updatedStartAt,
            updatedEndAt,
            dn,
            createdByUuid,
            dealershipDn ?: emptyList(),
            dealershipDnEmpty,
            hasCampaigns,
            isAlert,
            finishedParam,
            stepType?.name
        )
        .map { occurrenceEntity ->
            val occurrenceResponse = occurrenceMapper.toResponse(occurrenceEntity)
            occurrenceResponse
        }
        
        return OccurrencePaginatedResponse(
            occurrences = occurrences,
            totalElements = totalOccurrences,
            totalPages = totalPages,
            currentPage = page,
            pageSize = size,
            totalMinutes = totalMinutes,
            totalWithSteps = inProgressOccurrenceStats.getTotalOccurrences()
        )
    }

    @Transactional(readOnly = true)
    fun getOccurrenceByFiltersWithScheduleIds(persona: PersonaType,
                               authenticatedUser: UserAuthenticate,
                               occurrenceRequestList: OccurrenceRequestListWithScheduleIds,
                               filterType: OccurrenceFilterType) : List<OccurrenceInfoResponse>{

        val dn = if (persona == PersonaType.CONSULTANT) consultantsServiceImpl.consultantById(authenticatedUser.userId).dn else null

        log.info("Getting occurrences with scheduleIds filters size: [{}], scheduleIds: [{}], dn [{}]",
            occurrenceRequestList.scheduleIds, dn)

        return occurrenceRepository.listOccurrencesWithFilterAndScheduleIds(
            dn, occurrenceRequestList.scheduleIds, occurrenceRequestList.scheduleIds.isEmpty())
            .map {
                val stepsMap = it.occurrenceSteps.map {
                    OccurrenceStepResponse().apply {
                        stepName = it.stepId.name
                        stepDescription = it.stepId.description
                        startDate = it.dtStart
                        expectedEndDate = it.expectedDtEnd
                        endDate = it.dtEnd
                        latest = it.latest
                        estimatedTime = it.estimatedTime?.let { estTime ->
                            TimeUtils.minutesToDurationString(estTime)
                        }
                    }
                }
                OccurrenceInfoResponse(
                    uuid = it.uuid,
                    name = it.vehicle?.name,
                    model = it.vehicle?.model,
                    chassis = it.vehicle?.chassis,
                    assetId = it.vehicle?.assetId,
                    odometer = it.vehicle?.odometer,
                    hourMeter = it.vehicle?.hourMeter,
                    licensePlate = it.vehicle?.licensePlate,
                    criticality = it.criticality,
                    partnerId = UserRoleService.getPartnerId(persona, authenticatedUser),
                    scheduleUuid = it.scheduleUuid,
                    steps = stepsMap,
                    serviceBaySchedule = mapServiceBaySchedule(it.serviceBaySchedule.firstOrNull()),
                    createdByUserProfileId = it.createdByUserProfileId
                )
            }
    }

    fun getReviews(occurrenceUuid: String) : List<OccurrenceReviewResponse> =
        occurrenceReviewRepository.findByOccurrenceUuid(occurrenceUuid)
            .map { review ->  OccurrenceReviewResponse(occurrenceUuid, review.id!!.step, review.rate, review.comment)}

    @Transactional(readOnly = false, rollbackFor = [Exception::class])
    fun createReview(occurrenceUuid: String, step: StepTypeOccurrence, occurrenceReviewRequest: OccurrenceReviewRequest) {
        log.info("Create review for occurrence [{}] to step [{}] with rate and comment [{}]",occurrenceUuid, step, occurrenceReviewRequest)

        val occurrence = occurrenceRepository.findByUuidAndOccurrenceStepsStepId(occurrenceUuid, step) ?:
            throw BusinessException(ErrorCodeResponse(HttpStatus.NOT_FOUND.value().toString(), "Ocorrência não encontrada ou etapa não finalizada."))

        occurrence.reviews.find { it -> it.id!!.step == step }.let { review ->
            val or = OccurrenceReviewEntity(id = OccurrenceReviewId(occurrence.id, step),
                occurrence = occurrence,
                comment = occurrenceReviewRequest.comment,
                rate = occurrenceReviewRequest.rate,)

            occurrenceReviewRepository.save(or)
        }
    }

    @Transactional(readOnly = false, rollbackFor = [Exception::class])
    fun createDispatch(occurrenceUuid: String, createDispatchRequest: CreateDispatchRequest): DispatchEntity {
        log.info("Create dispatch [{}] for occurrence [{}] ", createDispatchRequest, occurrenceUuid)

        val occurrence = occurrenceRepository.getOccurrenceByUuid(occurrenceUuid) ?:
        throw BusinessException(ErrorCodeResponse(HttpStatus.NOT_FOUND.value().toString(), notFoundMessage))

        occurrence.dealership?.dn = createDispatchRequest.dn
        val d = DispatchEntity(
            dispatchUuid = UUID.randomUUID().toString(),
            occurrence = occurrence,
            status = DispatchStatus.WAITING_DEALERSHIP,
            occurrenceType = createDispatchRequest.occurrenceType,
            payer = createDispatchRequest.payer,
            authorizePayment = createDispatchRequest.authorizePayment,
            route = createDispatchRequest.route,
            dn = createDispatchRequest.dn)

        occurrence.dispatches.add(d)

        occurrenceRepository.save(occurrence)
        
        return d
    }

    @Transactional(readOnly = false, rollbackFor = [Exception::class])
    fun cancelDispatch(occurrenceUuid: String, dispatchUuid: String, cancelDispatchRequest: CancelDispatchRequest) {
        log.info("Cancel dispatch [{}] related to occurrence [{}]. Body [{}] ", dispatchUuid, occurrenceUuid, cancelDispatchRequest)

        val dispatch = dispatchRepository.findByOccurrenceUuidAndDispatchUuidAndStatusIs(occurrenceUuid, dispatchUuid, DispatchStatus.WAITING_DEALERSHIP) ?:
            throw BusinessException(ErrorCodeResponse(HttpStatus.NOT_FOUND.value().toString(), dispatchNotFoundMessage))

        dispatch.status = DispatchStatus.UNAVAILABLE
        dispatch.reasonRefusal = cancelDispatchRequest.reason
        dispatch.descriptionRefusal = cancelDispatchRequest.description

        dispatchRepository.save(dispatch)
    }

    @Transactional(readOnly = false, rollbackFor = [Exception::class])
    fun makeDispatchAvailable(occurrenceUuid: String, dispatchUuid: String) {
        log.info("Make dispatch [{}] related to occurrence [{}]. ", dispatchUuid, occurrenceUuid)

        val dispatch = dispatchRepository.findByOccurrenceUuidAndDispatchUuidAndStatusIs(occurrenceUuid, dispatchUuid, DispatchStatus.WAITING_DEALERSHIP) ?:
            throw BusinessException(ErrorCodeResponse(HttpStatus.NOT_FOUND.value().toString(), dispatchNotFoundMessage))

        dispatch.status = DispatchStatus.AVAILABLE

        dispatchRepository.save(dispatch)
    }

    @Transactional(readOnly = false, rollbackFor = [Exception::class])
    fun assignDriverToDispatch(occurrenceUuid: String, dispatchUuid: String, assignDriverToDispatchRequest: AssignDriverToDispatchRequest) {
        log.info("Assign driver [{}] to dispatch [{}] related to occurrence [{}]. ", assignDriverToDispatchRequest.driver, dispatchUuid, occurrenceUuid)

        val dispatch = dispatchRepository.findByOccurrenceUuidAndDispatchUuidAndStatusIs(occurrenceUuid, dispatchUuid, DispatchStatus.AVAILABLE) ?:
            throw BusinessException(ErrorCodeResponse(HttpStatus.NOT_FOUND.value().toString(), dispatchNotFoundMessage))

        dispatch.driver = assignDriverToDispatchRequest.driver
        dispatchRepository.save(dispatch)
    }

    @Transactional(readOnly = true)
    fun getStats(authenticatedUser: UserAuthenticate, persona: PersonaType): OccurrenceStatsResponse {
        log.info("Getting occurrence stats for user: [{}]", authenticatedUser.userId)
        
        val accountId = UserRoleService.getAccountByPersona(persona, authenticatedUser, towerAccountId)
        val partnerId = UserRoleService.getPartnerId(persona, authenticatedUser)
        
        // Get active occurrences (without end_date) for the user's account
        val activeOccurrences = occurrenceRepository.listOccurrencesWithFilter(
            10000, 0, accountId, emptyList(), true, null, null, partnerId,
            null, null, null, null, null, null, emptyList(), true, null, false,
            null, null
        )
        
        val chassisListOccurrencesNotStarted = mutableListOf<String>()
        val chassisListOccurrencesInProgress = mutableListOf<String>()
        val chassisListOccurrencesDelayed = mutableListOf<String>()
        
        val currentDateTime = LocalDateTime.now()
        
        for (occurrence in activeOccurrences) {
            val chassis = occurrence.vehicle?.chassis ?: continue
            
            // Check if occurrence has steps
            val hasSteps = occurrence.occurrenceSteps.isNotEmpty()
            
            if (!hasSteps) {
                // No steps - check if it's delayed or not started
                if (occurrence.scheduleUuid != null) {
                    // Try to get schedule information to check if it's delayed
                    try {
                        val scheduleUuid = occurrence.scheduleUuid ?: throw IllegalStateException("Schedule UUID is null")
                        val scheduleEntity = checkupScheduleRepository.getCheckupScheduleById(scheduleUuid)
                        if (scheduleEntity != null) {
                            val scheduledDate = scheduleEntity.schedule.scheduledDate
                            val isDelayed = scheduledDate.isBefore(currentDateTime)
                            if (isDelayed) {
                                chassisListOccurrencesDelayed.add(chassis)
                            } else {
                                chassisListOccurrencesNotStarted.add(chassis)
                            }
                        } else {
                            // If we can't find the schedule, use a fallback rule
                            val isDelayed = occurrence.createdAt.isBefore(currentDateTime.minusHours(24))
                            if (isDelayed) {
                                chassisListOccurrencesDelayed.add(chassis)
                            } else {
                                chassisListOccurrencesNotStarted.add(chassis)
                            }
                        }
                    } catch (e: Exception) {
                        log.warn("Could not fetch schedule for occurrence [{}]: {}", occurrence.uuid, e.message)
                        // Fallback rule if schedule fetch fails
                        val isDelayed = occurrence.createdAt.isBefore(currentDateTime.minusHours(24))
                        if (isDelayed) {
                            chassisListOccurrencesDelayed.add(chassis)
                        } else {
                            chassisListOccurrencesNotStarted.add(chassis)
                        }
                    }
                } else {
                    // No schedule UUID, consider as not started
                    chassisListOccurrencesNotStarted.add(chassis)
                }
            } else {
                // Has steps and no end_date - it's in progress
                chassisListOccurrencesInProgress.add(chassis)
            }
        }
        
        log.info("Occurrence stats calculated - Not started: [{}], In progress: [{}], Delayed: [{}]", 
            chassisListOccurrencesNotStarted.size, 
            chassisListOccurrencesInProgress.size, 
            chassisListOccurrencesDelayed.size)
        
        return OccurrenceStatsResponse(
            chassisListOccurrencesInProgress = chassisListOccurrencesInProgress,
            chassisListOccurrencesNotStarted = chassisListOccurrencesNotStarted,
            chassisListOccurrencesDelayed = chassisListOccurrencesDelayed
        )
    }

    @Transactional(readOnly = true)
    fun getOccurrencesWithMinutes(persona: PersonaType,
                                  authenticatedUser: UserAuthenticate,
                                  criticality: Int?,
                                  createdStartAt: LocalDate?,
                                  createdEndAt: LocalDate?,
                                  updatedStartAt: LocalDate?,
                                  updatedEndAt: LocalDate?,
                                  occurrenceType: List<OccurrenceType>?,
                                  createdByUuid: String?,
                                  dealershipDn: List<String>?,
                                  hasCampaigns: Boolean?,
                                  occurrenceRequestList: OccurrenceRequestList,
                                  stepType: StepTypeOccurrence?,
                                  filterType: OccurrenceFilterType): List<OccurrenceWithMinutesResponse> {

        if(validateDateCriteria(createdStartAt, createdEndAt) || validateDateCriteria(updatedStartAt, updatedEndAt))
            throw BusinessException(ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(), "Você deve fornece data e início e fim"))

        val dn = if (persona == PersonaType.CONSULTANT) consultantsServiceImpl.consultantById(authenticatedUser.userId).dn else null
        val accountId = UserRoleService.getAccountByPersona(persona, authenticatedUser, towerAccountId)
        val partnerId = UserRoleService.getPartnerId(persona, authenticatedUser)

        log.info("Getting occurrences with minutes for filters: accountId: [{}], chassis: [{}], occurrenceType: [{}], criticality: [{}], partnerId: [{}], createdStartAt: [{}], createdEndAt: [{}], updatedStartAt: [{}], updatedEndAt: [{}], dn [{}], dealershipDn [{}], stepType [{}]",
            accountId, occurrenceRequestList.chassisList, occurrenceType, criticality, partnerId, createdStartAt, createdEndAt, updatedStartAt, updatedEndAt, dn, dealershipDn, stepType)

        val occurrenceTypeString = occurrenceType?.map { it.type }?.joinToString(",") ?: null
        val dealershipDnList = dealershipDn ?: emptyList()
        val dealershipDnEmpty = dealershipDn.isNullOrEmpty()

        val finishedParam = when (filterType) {
            OccurrenceFilterType.ALL -> null
            OccurrenceFilterType.FINISHED -> true
            OccurrenceFilterType.OPEN -> false
        }
        
        val occurrencesWithMinutes = occurrenceRepository.listOccurrencesWithMinutes(
            accountId, occurrenceRequestList.chassisList, occurrenceRequestList.chassisList.isEmpty(), occurrenceTypeString, criticality, partnerId, createdStartAt, createdEndAt, updatedStartAt, updatedEndAt, dn, createdByUuid, dealershipDnList, dealershipDnEmpty, hasCampaigns, finishedParam, stepType?.name
        )

        val occurrenceWithMinutesGrouped = occurrencesWithMinutes.groupBy { it.getOccurrenceUuid() }
        var occurrenceWithSteps = listOf<OccurrenceWithMinutesResponse>()
        for (occurrenceGroup in occurrenceWithMinutesGrouped) {
            val steps = occurrenceGroup.value.map { occurrence ->
                OccurrenceStepWithMinutesResponse(
                    stepId = occurrence.getStep() ?: "SEM_ETAPA",
                    totalMinutes = occurrence.getTotalMinutes(),
                    stepStart = occurrence.getStepStart(),
                    hasFinished = occurrence.getStepEnd() != null
                )
            }.filter { it.stepId != "SEM_ETAPA" }
            val firstOccurrence = occurrenceGroup.value.first()
            val occurrenceResponse = OccurrenceWithMinutesResponse(
                occurrenceUuid = firstOccurrence.getOccurrenceUuid(),
                totalMinutes = steps.sumOf { it.totalMinutes },
                customer = firstOccurrence.getCustomer(),
                model = firstOccurrence.getModel(),
                legislation = firstOccurrence.getLegislation(),
                city = firstOccurrence.getCity(),
                state = firstOccurrence.getState(),
                chassis = firstOccurrence.getChassis(),
                dealershipName = firstOccurrence.getFantasyName(),
                dn = firstOccurrence.getDn(),
                steps = steps
            )
            occurrenceWithSteps = occurrenceWithSteps + occurrenceResponse
        }

        return occurrenceWithSteps
    }

    private fun validateDateCriteria(startDate: LocalDate?, endDate: LocalDate?) : Boolean {
        return startDate == null && endDate != null || startDate != null && endDate == null
    }

    private fun mapServiceBaySchedule(serviceBaySchedule: ServiceBayScheduleEntity?): ServiceBayScheduleResponse? {
        return serviceBaySchedule?.let { sbs ->
            ServiceBayScheduleResponse(
                id = sbs.id,
                startDate = sbs.startDate,
                endDate = sbs.endDate,
                dn = sbs.dn,
                createdAt = sbs.createdAt,
                updatedAt = sbs.updatedAt,
                active = sbs.active,
                createdBy = sbs.createdBy,
                createdById = sbs.createdById,
                serviceBay = sbs.serviceBay?.let { sb ->
                    ServiceBayResponse(
                        id = sb.id,
                        name = sb.name,
                        dn = sb.dn,
                        createdAt = sb.createdAt,
                        updatedAt = sb.updatedAt,
                        active = sb.active
                    )
                }
            )
        }
    }
}