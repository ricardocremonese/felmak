package br.com.vw.uptime.schedule.infrastructure.services.occurence

import br.com.vw.uptime.schedule.core.enums.PersonaType
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.controllers.OccurrenceRequestList
import br.com.vw.uptime.schedule.entrypoint.controllers.OccurrenceFilterType
import br.com.vw.uptime.schedule.entrypoint.responses.occurrence.Daily
import br.com.vw.uptime.schedule.entrypoint.responses.occurrence.Month
import br.com.vw.uptime.schedule.entrypoint.responses.occurrence.OccurrenceQuantityResponse
import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.OccurrenceAnalyticsRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.OccurrenceRepository
import br.com.vw.uptime.schedule.infrastructure.services.user.ConsultantsServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.user.UserRoleService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.LocalDate
import java.time.YearMonth
import java.util.function.Supplier

@Service
class OccurrenceAnalyticsService(private val occurrenceRepository: OccurrenceRepository,
                                 private val occurrenceAnalyticsRepository: OccurrenceAnalyticsRepository,
                                 private val consultantsServiceImpl: ConsultantsServiceImpl) {

    companion object {
        private val log = LoggerFactory.getLogger(OccurrenceService::class.java)
        private const val NULL_TIME: String = "0h 0m"
    }

    @Value("\${tower-account-id}")
    lateinit var towerAccountId:String

    fun getQuantity(
        persona: PersonaType,
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
        filterType: OccurrenceFilterType,) : OccurrenceQuantityResponse {

        validateDatesCriteria(createdStartAt, createdEndAt)
        validateDatesCriteria(updatedStartAt, updatedEndAt)

        val dn = getDn(persona, authenticatedUser.userId)
        val accountId = UserRoleService.getAccountByPersona(persona, authenticatedUser, towerAccountId)
        val partnerId = UserRoleService.getPartnerId(persona, authenticatedUser)

        log.info("Getting total of occurrences by steps with filters: accountId: [{}], chassis: [{}],  criticality: [{}], createdStartAt: [{}], createdEndAt: [{}], updatedStartAt: [{}], updatedStartAt: [{}], dn [{}], occurrenceType [{}], createdByUuid [{}], dealershipDn [{}], hasCampaigns [{}]",
            accountId, occurrenceRequestList.chassisList, criticality, createdStartAt, createdEndAt, updatedStartAt, updatedEndAt, dn, occurrenceType, createdByUuid, dealershipDn, hasCampaigns)
        val occurrenceTypeString = occurrenceType?.map { it.type }?.joinToString(",") ?: null
        val dealershipDnList = dealershipDn ?: emptyList()
        val dealershipDnEmpty = dealershipDn.isNullOrEmpty()
        val queryResponse = when (filterType) {
            OccurrenceFilterType.ALL -> {
                val finished = occurrenceRepository.calculateOccurrenceFinished(accountId, occurrenceRequestList.chassisList, occurrenceRequestList.chassisList.isEmpty(), criticality, partnerId, createdStartAt, createdEndAt, updatedStartAt, updatedEndAt, dn, occurrenceTypeString, createdByUuid, dealershipDnList, dealershipDnEmpty, hasCampaigns, true)
                val inProgress = occurrenceRepository.calculateOccurrenceInProgress(accountId, occurrenceRequestList.chassisList, occurrenceRequestList.chassisList.isEmpty(), criticality, partnerId, createdStartAt, createdEndAt, updatedStartAt, updatedEndAt, dn, occurrenceTypeString, createdByUuid, dealershipDnList, dealershipDnEmpty, hasCampaigns)
                finished + inProgress
            }
            OccurrenceFilterType.FINISHED -> occurrenceRepository.calculateOccurrenceFinished(accountId, occurrenceRequestList.chassisList, occurrenceRequestList.chassisList.isEmpty(), criticality, partnerId, createdStartAt, createdEndAt, updatedStartAt, updatedEndAt, dn, occurrenceTypeString, createdByUuid, dealershipDnList, dealershipDnEmpty, hasCampaigns, true)
            OccurrenceFilterType.OPEN -> occurrenceRepository.calculateOccurrenceInProgress(accountId, occurrenceRequestList.chassisList, occurrenceRequestList.chassisList.isEmpty(), criticality, partnerId, createdStartAt, createdEndAt, updatedStartAt, updatedEndAt, dn, occurrenceTypeString, createdByUuid, dealershipDnList, dealershipDnEmpty, hasCampaigns)
        }

        val amountDailyByStep = queryResponse.groupBy({ it.getStep() }, { Daily(it.getDate(), it.getAmount(), it.getChassisList() ?: emptyList(), it.getOccurrenceUuidList() ?: emptyList()) })

        val totalByStepAndMonth : MutableMap<String, MutableList<Month>> = mutableMapOf()
        queryResponse.groupBy { Pair(it.getStep(), YearMonth.from(it.getDate())) }
            .forEach { (key, occurrences) ->
                val step = key.first
                val yearMonth = key.second
                val totalAmount = occurrences.sumOf { it.getAmount() }
                val allChassis = occurrences.flatMap { it.getChassisList() ?: emptyList() }.distinct()
                val allOccurrenceUuid = occurrences.flatMap { it.getOccurrenceUuidList() ?: emptyList() }.distinct()
                totalByStepAndMonth.getOrPut(step) { mutableListOf() }.add(Month(yearMonth, totalAmount, allChassis, allOccurrenceUuid))
            }

        return OccurrenceQuantityResponse(daily = amountDailyByStep, monthly = totalByStepAndMonth)
    }

    fun getAverageTimeByStepAndVehicleModel(
        persona: PersonaType,
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
        filterType: OccurrenceFilterType,) : Map<String, List<OccurrenceVehicleResponse>> {

        validateDatesCriteria(createdStartAt, createdEndAt)
        validateDatesCriteria(updatedStartAt, updatedEndAt)

        val dn = getDn(persona, authenticatedUser.userId)
        val accountId = UserRoleService.getAccountByPersona(persona, authenticatedUser, towerAccountId)
        val partnerId = UserRoleService.getPartnerId(persona, authenticatedUser)

        log.info("Getting average by steps with filters: accountId: [{}], chassis: [{}],  criticality: [{}], createdStartAt: [{}], createdEndAt: [{}], updatedStartAt: [{}], updatedStartAt: [{}], dn [{}], occurrenceType [{}], createdByUuid [{}], dealershipDn [{}]",
            accountId, occurrenceRequestList.chassisList, criticality, createdStartAt, createdEndAt, updatedStartAt, updatedEndAt, dn, occurrenceType, createdByUuid, dealershipDn)
        val occurrenceTypeString = occurrenceType?.map { it.type }?.joinToString(",") ?: null
        val dealershipDnList = dealershipDn ?: emptyList()
        val dealershipDnEmpty = dealershipDn.isNullOrEmpty()
        val finishedParam = when (filterType) {
            OccurrenceFilterType.ALL -> null
            OccurrenceFilterType.FINISHED -> true
            OccurrenceFilterType.OPEN -> false
        }
        
        val queryResponse = occurrenceRepository.calculateAverageTime(accountId, occurrenceRequestList.chassisList, occurrenceRequestList.chassisList.isEmpty(), criticality, partnerId, createdStartAt, createdEndAt, updatedStartAt, updatedEndAt, dn, occurrenceTypeString, createdByUuid, dealershipDnList, dealershipDnEmpty, hasCampaigns, finishedParam)
        val amountDailyByStep = queryResponse.groupBy({ it.getStep() }, { OccurrenceVehicleResponse(it.getVehicle(),
            it.getAverageTime()?.formattedTime() ?: NULL_TIME, (it.getAverageTime() ?: 0L)) })

        return amountDailyByStep
    }

    fun getStatsByCustomer(persona: PersonaType,
            authenticatedUser: UserAuthenticate,
            chassis: String?,
            criticality: Int?,
            createdStartAt: LocalDate?,
            createdEndAt: LocalDate?,
            updatedStartAt: LocalDate?,
            updatedEndAt: LocalDate?,
            dn: String?,
            step: StepTypeOccurrence?,
            vehicle: String?,
            em: String?,
            state: String?,
            city: String?,) : Map<String, List<Map<String, Any>>> {

        validateDatesCriteria(createdStartAt, createdEndAt)
        validateDatesCriteria(updatedStartAt, updatedEndAt)

        val userDn = getDn(persona, authenticatedUser.userId) ?: dn
        val accountId = getAccountId(persona, authenticatedUser.accountId)

        log.info("Getting stats of occurrences by customers with filters: accountId: [{}], chassis: [{}],  criticality: [{}], createdStartAt: [{}], createdEndAt: [{}], updatedStartAt: [{}], updatedStartAt: [{}], dn [{}], vehicle [{}], em [{}], state [{}], city [{}]",
            accountId, chassis, criticality, createdStartAt, createdEndAt, updatedStartAt, updatedEndAt, userDn, vehicle, em, state, city)

        val amountList = occurrenceAnalyticsRepository.calculateOccurrenceByCustomerAmount(
            chassis = chassis,
            criticality = criticality,
            createdStartAt = createdStartAt,
            createdEndAt = createdEndAt,
            updatedStartAt = updatedStartAt,
            updatedEndAt = updatedEndAt,
            dn = userDn,
            stepType = step?.name,
            vehicle = vehicle,
            emissionStandard = em,
            state = state,
            city = city,
            accountId = accountId
        )

        val averageList = occurrenceAnalyticsRepository.calculateOccurrenceByCustomerAverage(
            chassis = chassis,
            criticality = criticality,
            createdStartAt = createdStartAt,
            createdEndAt = createdEndAt,
            updatedStartAt = updatedStartAt,
            updatedEndAt = updatedEndAt,
            dn = userDn,
            stepType = step?.name,
            vehicle = vehicle,
            emissionStandard = em,
            state = state,
            city = city,
            accountId = accountId
        )

        val mapValues = mapOf(
            "amount" to amountList,
            "average" to averageList
        )

        return mapValues
    }

    fun getStatsByDealership(persona: PersonaType,
                           authenticatedUser: UserAuthenticate,
                           chassis: String?,
                           criticality: Int?,
                           createdStartAt: LocalDate?,
                           createdEndAt: LocalDate?,
                           updatedStartAt: LocalDate?,
                           updatedEndAt: LocalDate?,
                           dn: String?,
                           step: StepTypeOccurrence?,
                           vehicle: String?,
                           em: String?,
                           state: String?,
                           city: String?,) : List<Map<String, Map<String, Any?>>> {

        validateDatesCriteria(createdStartAt, createdEndAt)
        validateDatesCriteria(updatedStartAt, updatedEndAt)

        val userDn = getDn(persona, authenticatedUser.userId) ?: dn
        val accountId = getAccountId(persona, authenticatedUser.accountId)

        log.info("Getting stats of occurrences by dealership with filters: accountId: [{}], chassis: [{}],  criticality: [{}], createdStartAt: [{}], createdEndAt: [{}], updatedStartAt: [{}], updatedStartAt: [{}], dn [{}], vehicle [{}], em [{}], state [{}], city [{}]",
            accountId, chassis, criticality, createdStartAt, createdEndAt, updatedStartAt, updatedEndAt, userDn, vehicle, em, state, city)

        val queryResponse = occurrenceRepository.calculateStatsByDealership(accountId, chassis, criticality,
            createdStartAt, createdEndAt, updatedStartAt, updatedEndAt,
            userDn, step?.name, vehicle, em, state, city)


        return queryResponse
            ?.filter { it.getDn()  == null}
            ?.map { r -> mapOf(r.getFantasyName() to mapOf("total" to r.getTotal(),
                "average" to r.getAverageTime()?.formattedTime(),
                "dealerships" to queryResponse.stream().filter { it.getFantasyName() == r.getFantasyName() && it.getDn() != null}
                    .map { DealershipStatsResponse("${it.getFantasyName()}-${it.getDn()}", (it.getTotal() ?: 0), (it.getAverageTime()?.formattedTime() ?: NULL_TIME), it.getChassisList() ) }.toList()))

            }?.toList() ?: emptyList()
    }

    fun getOccurrenceByLegislation(
        persona: PersonaType,
        model:String?,
        customer:String?,
        state:String?,
        city:String?,
        stepType:StepTypeOccurrence?,
        authenticatedUser: UserAuthenticate,
        createdStartAt: LocalDate,
        createdEndAt: LocalDate
    ) : Map<String, List<Map<String, Any>>> {

        validateDatesCriteria(createdStartAt, createdEndAt)

        val dn = getDn(persona, authenticatedUser.userId)
        val accountId = getAccountId(persona, authenticatedUser.accountId)

        log.info("Getting total of occurrences by legislation: model [{}], customer [{}], state [{}],city [{}], stepType [{}], accountId: [{}], createdStartAt: [{}], createdEndAt: [{}], dn [{}]",
            model, customer, state, city, stepType?.name, accountId, createdStartAt, createdEndAt, dn
        )

        val amountList = occurrenceAnalyticsRepository.calculateOccurrenceByLegislation(
            model = model,
            customer = customer,
            state = state,
            city = city,
            stepType = stepType?.name,
            startDate = createdStartAt,
            endDate = createdEndAt,
            accountId = accountId,
            dn = dn
        )

        val averageList = occurrenceAnalyticsRepository.calculateOccurrenceByLegislationAverage(
            model = model,
            customer = customer,
            state = state,
            city = city,
            stepType = stepType?.name,
            startDate = createdStartAt,
            endDate = createdEndAt,
            accountId = accountId,
            dn = dn
        )

        val mapValues = mapOf(
            "amount" to amountList,
            "average" to averageList
        )

        return mapValues
    }

    fun getOccurrenceByModel(
        persona: PersonaType,
        legislation:String?,
        customer:String?,
        state:String?,
        city:String?,
        stepType:StepTypeOccurrence?,
        authenticatedUser: UserAuthenticate,
        createdStartAt: LocalDate,
        createdEndAt: LocalDate
    ) : Map<String, List<Map<String, Any>>> {

        validateDatesCriteria(createdStartAt, createdEndAt)

        val dn = getDn(persona, authenticatedUser.userId)
        val accountId = getAccountId(persona, authenticatedUser.accountId)

        log.info("Getting total of occurrences by model: legislation [{}], customer [{}], state [{}],city [{}], stepType [{}], accountId: [{}], createdStartAt: [{}], createdEndAt: [{}], dn [{}]",
            legislation, customer, state, city, stepType?.name, accountId, createdStartAt, createdEndAt, dn
        )

        val amountList = occurrenceAnalyticsRepository.calculateOccurrenceByModelAmount(
            emissionStandard = legislation,
            customer = customer,
            state = state,
            city = city,
            stepType = stepType?.name,
            startDate = createdStartAt,
            endDate = createdEndAt,
            accountId = accountId,
            dn = dn
        )

        val averageList = occurrenceAnalyticsRepository.calculateOccurrenceByModelAverage(
            emissionStandard = legislation,
            customer = customer,
            state = state,
            city = city,
            stepType = stepType?.name,
            startDate = createdStartAt,
            endDate = createdEndAt,
            accountId = accountId,
            dn = dn
        )

        val mapValues = mapOf(
            "amount" to amountList,
            "average" to averageList
        )

        return mapValues
    }

    fun getOccurrenceByState(
        persona: PersonaType,
        legislation:String?,
        customer:String?,
        model:String?,
        city:String?,
        stepType:StepTypeOccurrence?,
        authenticatedUser: UserAuthenticate,
        createdStartAt: LocalDate,
        createdEndAt: LocalDate
    ) : Map<String, List<Map<String, Any>>> {

        validateDatesCriteria(createdStartAt, createdEndAt)

        val dn = getDn(persona, authenticatedUser.userId)
        val accountId = getAccountId(persona, authenticatedUser.accountId)

        log.info("Getting total of occurrences by model: legislation [{}], customer [{}], model [{}],city [{}], stepType [{}], accountId: [{}], createdStartAt: [{}], createdEndAt: [{}], dn [{}]",
            legislation, customer, model, city, stepType?.name, accountId, createdStartAt, createdEndAt, dn
        )

        val amountList = occurrenceAnalyticsRepository.calculateOccurrenceByStateAmount(
            emissionStandard = legislation,
            customer = customer,
            model = model,
            city = city,
            stepType = stepType?.name,
            startDate = createdStartAt,
            endDate = createdEndAt,
            accountId = accountId,
            dn = dn
        )

        val averageList = occurrenceAnalyticsRepository.calculateOccurrenceByStateAverage(
            emissionStandard = legislation,
            customer = customer,
            model = model,
            city = city,
            stepType = stepType?.name,
            startDate = createdStartAt,
            endDate = createdEndAt,
            accountId = accountId,
            dn = dn
        )

        val mapValues = mapOf(
            "amount" to amountList,
            "average" to averageList
        )

        return mapValues
    }
    fun getOccurrenceByCity(
        persona: PersonaType,
        legislation:String?,
        customer:String?,
        model:String?,
        state:String?,
        stepType:StepTypeOccurrence?,
        authenticatedUser: UserAuthenticate,
        createdStartAt: LocalDate,
        createdEndAt: LocalDate
    ) : Map<String, List<Map<String, Any>>> {

        validateDatesCriteria(createdStartAt, createdEndAt)

        val dn = getDn(persona, authenticatedUser.userId)
        val accountId = getAccountId(persona, authenticatedUser.accountId)

        log.info("Getting total of occurrences by model: legislation [{}], customer [{}], model [{}],state [{}], stepType [{}], accountId: [{}], createdStartAt: [{}], createdEndAt: [{}], dn [{}]",
            legislation, customer, model, state, stepType?.name, accountId, createdStartAt, createdEndAt, dn
        )

        val amountList = occurrenceAnalyticsRepository.calculateOccurrenceByCityAmount(
            emissionStandard = legislation,
            customer = customer,
            model = model,
            state = state,
            stepType = stepType?.name,
            startDate = createdStartAt,
            endDate = createdEndAt,
            accountId = accountId,
            dn = dn
        )

        val averageList = occurrenceAnalyticsRepository.calculateOccurrenceByCityAverage(
            emissionStandard = legislation,
            customer = customer,
            model = model,
            state = state,
            stepType = stepType?.name,
            startDate = createdStartAt,
            endDate = createdEndAt,
            accountId = accountId,
            dn = dn
        )

        val mapValues = mapOf(
            "amount" to amountList,
            "average" to averageList
        )

        return mapValues
    }

    fun getOccurrenceByStep(
        persona: PersonaType,
        legislation:String?,
        customer:String?,
        model:String?,
        state:String?,
        city:String?,
        authenticatedUser: UserAuthenticate,
        createdStartAt: LocalDate,
        createdEndAt: LocalDate
    ) : Map<String, List<Map<String, Any>>> {

        validateDatesCriteria(createdStartAt, createdEndAt)

        val dn = getDn(persona, authenticatedUser.userId)
        val accountId = getAccountId(persona, authenticatedUser.accountId)

        log.info("Getting total of occurrences by model: legislation [{}], customer [{}], model [{}],state [{}], city [{}], accountId: [{}], createdStartAt: [{}], createdEndAt: [{}], dn [{}]",
            legislation, customer, model, state, city, accountId, createdStartAt, createdEndAt, dn
        )

        val amountList = occurrenceAnalyticsRepository.calculateOccurrenceByStepAmount(
            emissionStandard = legislation,
            customer = customer,
            model = model,
            state = state,
            city = city,
            startDate = createdStartAt,
            endDate = createdEndAt,
            accountId = accountId,
            dn = dn
        )

        val averageList = occurrenceAnalyticsRepository.calculateOccurrenceByStepAverage(
            emissionStandard = legislation,
            customer = customer,
            model = model,
            state = state,
            city = city,
            startDate = createdStartAt,
            endDate = createdEndAt,
            accountId = accountId,
            dn = dn
        )

        val mapValues = mapOf(
            "amount" to amountList,
            "average" to averageList
        )

        return mapValues
    }

    fun getOccurrenceTotals(
        persona: PersonaType,
        legislation:String?,
        customer:String?,
        model:String?,
        state:String?,
        city:String?,
        stepType: StepTypeOccurrence?,
        authenticatedUser: UserAuthenticate,
        createdStartAt: LocalDate,
        createdEndAt: LocalDate
    ) : Map<String, Any> {

        validateDatesCriteria(createdStartAt, createdEndAt)

        val dn = getDn(persona, authenticatedUser.userId)
        val accountId = getAccountId(persona, authenticatedUser.accountId)

        log.info("Getting total of occurrences by model: legislation [{}],customer [{}], model [{}],state [{}], city [{}], stepType [{}], accountId: [{}], createdStartAt: [{}], createdEndAt: [{}], dn [{}]",
            legislation, customer, model, state, city, stepType?.name, accountId, createdStartAt, createdEndAt, dn
        )

        val totalFinished = occurrenceAnalyticsRepository.calculateTotalFinishedOccurrence(
            emissionStandard = legislation,
            customer = customer,
            model = model,
            state = state,
            city = city,
            startDate = createdStartAt,
            endDate = createdEndAt,
            accountId = accountId,
            dn = dn
        )

        val totalInProgress = occurrenceAnalyticsRepository.calculateTotalInProgressOccurrence(
            emissionStandard = legislation,
            customer = customer,
            model = model,
            state = state,
            city = city,
            stepType = stepType?.name,
            startDate = createdStartAt,
            endDate = createdEndAt,
            accountId = accountId,
            dn = dn
        )

        return totalFinished + totalInProgress
    }

    private fun validateDatesCriteria(startDate: LocalDate?, endDate: LocalDate?) {
        if(startDate == null && endDate != null || startDate != null && endDate == null)
            throw BusinessException(ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(), "Você deve fornece data e início e fim"))

        if(startDate != null && endDate != null) {
            if (startDate.isAfter(endDate))
                throw BusinessException(ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(), "A data de início deve ser antes da data fim"))

            if (startDate.plusYears(1).isBefore(endDate))
                throw BusinessException(ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(), "Intervalo de data superior a 1 ano não permitido"))
        }
    }

    private fun getDn(persona: PersonaType, userId: String) : String? = if (persona == PersonaType.CONSULTANT) consultantsServiceImpl.consultantById(userId).dn else null
    private fun getAccountId(persona: PersonaType, userAccountId: String) : String? = if(userAccountId == this.towerAccountId && persona == PersonaType.TOWER || persona == PersonaType.CONSULTANT)  null else userAccountId

    private fun <T> execQuery(isGetFinishedOccurrences: Boolean, occurrenceRunning: Supplier<T>, finishedOccurrence: Supplier<T>) : T {
        if (isGetFinishedOccurrences)
            return finishedOccurrence.get()
        return occurrenceRunning.get()
    }

    private fun Long.formattedTime() : String {
        val duration = Duration.ofMinutes(this)
        val days: String = if(duration.toDaysPart() == 0L) "" else "${duration.toDaysPart()}D"
        val hours: Int = duration.toHoursPart()
        val minutes: Int = duration.toMinutesPart()
        return "$days ${hours}h ${minutes}m"
    }
}

data class OccurrenceVehicleResponse(val name: String, val average: String, val averageInMinutes: Long)
data class DealershipStatsResponse(val name: String, val total: Long, val average: String, val chassisList: List<String>)
