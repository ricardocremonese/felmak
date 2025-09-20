package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.core.enums.PersonaType
import br.com.vw.uptime.schedule.entrypoint.responses.occurrence.OccurrenceQuantityResponse
import br.com.vw.uptime.schedule.infrastructure.services.occurence.OccurrenceType
import br.com.vw.uptime.schedule.infrastructure.services.occurence.OccurrenceAnalyticsService
import br.com.vw.uptime.schedule.infrastructure.services.occurence.OccurrenceVehicleResponse
import br.com.vw.uptime.schedule.infrastructure.services.occurence.StepTypeOccurrence
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import jakarta.servlet.http.HttpServletRequest
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.util.*
import kotlin.jvm.optionals.getOrNull

@RestController
@RequestMapping("/v1/occurrence/analytics")
class OccurrenceAnalyticsController(val usrSvc:UserAuthServiceImpl,
    private val ocurrenceAnalyticsService: OccurrenceAnalyticsService,) {

    @PostMapping(path = ["/{persona}/quantity", "/{persona}/quantity/finished", "/{persona}/quantity/all"])
    fun getOccurrenceQuantity(@PathVariable(required = true, name = "persona") persona: PersonaType,
                              @RequestParam(required = false, name = "criticality") criticality: Optional<Int>,
                              @RequestParam(required = false, name = "createdStartAt") createdStartAt: Optional<LocalDate>,
                              @RequestParam(required = false, name = "createdEndAt") createdEndAt: Optional<LocalDate>,
                              @RequestParam(required = false, name = "updatedStartAt") updatedStartAt: Optional<LocalDate>,
                              @RequestParam(required = false, name = "updatedEndAt") updatedEndAt: Optional<LocalDate>,
                              @RequestParam(required = false, name = "occurrenceType") occurrenceType: Optional<List<OccurrenceType>>,
                              @RequestParam(required = false, name = "createdByUuid") createdByUuid: Optional<String>,
                              @RequestParam(required = false, name = "dealershipDn") dealershipDn: Optional<List<String>>,
                              @RequestParam(required = false, name = "hasCampaigns") hasCampaigns: Optional<Boolean>,
                              @RequestBody(required = false) occurrenceRequestList: OccurrenceRequestList,
                              httpServletRequest: HttpServletRequest): OccurrenceQuantityResponse {

        return ocurrenceAnalyticsService.getQuantity(persona,
            usrSvc.usr(),
            criticality.getOrNull(),
            createdStartAt.getOrNull(),
            createdEndAt.getOrNull(),
            updatedStartAt.getOrNull(),
            updatedEndAt.getOrNull(),
            occurrenceType.getOrNull(),
            createdByUuid.getOrNull(),
            dealershipDn.getOrNull(),
            hasCampaigns.getOrNull(),
            occurrenceRequestList,
            getOccurrenceFilterType(httpServletRequest))
    }

    @PostMapping(path = ["/{persona}/average-by-step", "/{persona}/average-by-step/finished", "/{persona}/average-by-step/all"])
    fun getOccurrenceVehicleStep(@PathVariable(required = true, name = "persona") persona: PersonaType,
                             @RequestParam(required = false, name = "criticality") criticality: Optional<Int>,
                             @RequestParam(required = false, name = "createdStartAt") createdStartAt: Optional<LocalDate>,
                             @RequestParam(required = false, name = "createdEndAt") createdEndAt: Optional<LocalDate>,
                             @RequestParam(required = false, name = "updatedStartAt") updatedStartAt: Optional<LocalDate>,
                             @RequestParam(required = false, name = "updatedEndAt") updatedEndAt: Optional<LocalDate>,
                             @RequestParam(required = false, name = "occurrenceType") occurrenceType: Optional<List<OccurrenceType>>,
                             @RequestParam(required = false, name = "createdByUuid") createdByUuid: Optional<String>,
                             @RequestParam(required = false, name = "dealershipDn") dealershipDn: Optional<List<String>>,
                             @RequestParam(required = false, name = "hasCampaigns") hasCampaigns: Optional<Boolean>,
                            @RequestBody(required = false) occurrenceRequestList: OccurrenceRequestList,
                                 httpServletRequest: HttpServletRequest,): Map<String, List<OccurrenceVehicleResponse>> {
        return ocurrenceAnalyticsService.getAverageTimeByStepAndVehicleModel(persona,
            usrSvc.usr(),
            criticality.getOrNull(),
            createdStartAt.getOrNull(),
            createdEndAt.getOrNull(),
            updatedStartAt.getOrNull(),
            updatedEndAt.getOrNull(),
            occurrenceType.getOrNull(),
            createdByUuid.getOrNull(),
            dealershipDn.getOrNull(),
            hasCampaigns.getOrNull(),
            occurrenceRequestList,
            getOccurrenceFilterType(httpServletRequest),)
    }

    @GetMapping(path = ["/{persona}/occurrence-by-legislation"])
    fun getOccurrenceByLegislation(
        @PathVariable(required = true, name = "persona") persona: PersonaType,
        @RequestParam(required = false, name = "model") model: String?,
        @RequestParam(required = false, name = "city") city: String?,
        @RequestParam(required = false, name = "state") state: String?,
        @RequestParam(required = false, name = "customer") customer: String?,
        @RequestParam(required = false, name = "stepType") stepTypeOccurrence: StepTypeOccurrence?,
        @RequestParam(required = true, name = "createdStartAt") createdStartAt: LocalDate,
        @RequestParam(required = true, name = "createdEndAt") createdEndAt: LocalDate
    ): Map<String, List<Map<String, Any>>> {
        return ocurrenceAnalyticsService.getOccurrenceByLegislation(
            model = model,
            customer = customer,
            city = city,
            state = state,
            stepType = stepTypeOccurrence,
            persona = persona,
            authenticatedUser = usrSvc.usr(),
            createdStartAt = createdStartAt,
            createdEndAt = createdEndAt
        )
    }

    @GetMapping(path = ["/{persona}/occurrence-by-model"])
    fun getOccurrenceByModel(
        @PathVariable(required = true, name = "persona") persona: PersonaType,
        @RequestParam(required = false, name = "legislation") legislation: String?,
        @RequestParam(required = false, name = "city") city: String?,
        @RequestParam(required = false, name = "state") state: String?,
        @RequestParam(required = false, name = "customer") customer: String?,
        @RequestParam(required = false, name = "stepType") stepTypeOccurrence: StepTypeOccurrence?,
        @RequestParam(required = true, name = "createdStartAt") createdStartAt: LocalDate,
        @RequestParam(required = true, name = "createdEndAt") createdEndAt: LocalDate
    ): Map<String, List<Map<String, Any>>> {
        return ocurrenceAnalyticsService.getOccurrenceByModel(
            legislation = legislation,
            customer = customer,
            city = city,
            state = state,
            stepType = stepTypeOccurrence,
            persona = persona,
            authenticatedUser = usrSvc.usr(),
            createdStartAt = createdStartAt,
            createdEndAt = createdEndAt
        )
    }

    @GetMapping(path = ["/{persona}/occurrence-by-state"])
    fun getOccurrenceByState(
        @PathVariable(required = true, name = "persona") persona: PersonaType,
        @RequestParam(required = false, name = "legislation") legislation: String?,
        @RequestParam(required = false, name = "city") city: String?,
        @RequestParam(required = false, name = "model") model: String?,
        @RequestParam(required = false, name = "customer") customer: String?,
        @RequestParam(required = false, name = "stepType") stepTypeOccurrence: StepTypeOccurrence?,
        @RequestParam(required = true, name = "createdStartAt") createdStartAt: LocalDate,
        @RequestParam(required = true, name = "createdEndAt") createdEndAt: LocalDate
    ): Map<String, List<Map<String, Any>>> {
        return ocurrenceAnalyticsService.getOccurrenceByState(
            legislation = legislation,
            customer = customer,
            city = city,
            model = model,
            stepType = stepTypeOccurrence,
            persona = persona,
            authenticatedUser = usrSvc.usr(),
            createdStartAt = createdStartAt,
            createdEndAt = createdEndAt
        )
    }

    @GetMapping(path = ["/{persona}/occurrence-by-city"])
    fun getOccurrenceByCity(
        @PathVariable(required = true, name = "persona") persona: PersonaType,
        @RequestParam(required = false, name = "legislation") legislation: String?,
        @RequestParam(required = false, name = "state") state: String?,
        @RequestParam(required = false, name = "model") model: String?,
        @RequestParam(required = false, name = "customer") customer: String?,
        @RequestParam(required = false, name = "stepType") stepTypeOccurrence: StepTypeOccurrence?,
        @RequestParam(required = true, name = "createdStartAt") createdStartAt: LocalDate,
        @RequestParam(required = true, name = "createdEndAt") createdEndAt: LocalDate
    ): Map<String, List<Map<String, Any>>> {
        return ocurrenceAnalyticsService.getOccurrenceByCity(
            legislation = legislation,
            customer = customer,
            state = state,
            model = model,
            stepType = stepTypeOccurrence,
            persona = persona,
            authenticatedUser = usrSvc.usr(),
            createdStartAt = createdStartAt,
            createdEndAt = createdEndAt
        )
    }

    @GetMapping(path = ["/{persona}/occurrence-by-step"])
    fun getOccurrenceByStepType(
        @PathVariable(required = true, name = "persona") persona: PersonaType,
        @RequestParam(required = false, name = "legislation") legislation: String?,
        @RequestParam(required = false, name = "state") state: String?,
        @RequestParam(required = false, name = "model") model: String?,
        @RequestParam(required = false, name = "customer") customer: String?,
        @RequestParam(required = false, name = "city") city: String?,
        @RequestParam(required = true, name = "createdStartAt") createdStartAt: LocalDate,
        @RequestParam(required = true, name = "createdEndAt") createdEndAt: LocalDate
    ): Map<String, List<Map<String, Any>>> {
        return ocurrenceAnalyticsService.getOccurrenceByStep(
            legislation = legislation,
            customer = customer,
            state = state,
            model = model,
            city = city,
            persona = persona,
            authenticatedUser = usrSvc.usr(),
            createdStartAt = createdStartAt,
            createdEndAt = createdEndAt
        )
    }

    @GetMapping(path = ["/{persona}/occurrence-totals"])
    fun getOccurrenceTotals(
        @PathVariable(required = true, name = "persona") persona: PersonaType,
        @RequestParam(required = false, name = "legislation") legislation: String?,
        @RequestParam(required = false, name = "state") state: String?,
        @RequestParam(required = false, name = "model") model: String?,
        @RequestParam(required = false, name = "customer") customer: String?,
        @RequestParam(required = false, name = "city") city: String?,
        @RequestParam(required = false, name = "stepType") stepType: StepTypeOccurrence?,
        @RequestParam(required = true, name = "createdStartAt") createdStartAt: LocalDate,
        @RequestParam(required = true, name = "createdEndAt") createdEndAt: LocalDate
    ): Map<String, Any> {
        return ocurrenceAnalyticsService.getOccurrenceTotals(
            legislation = legislation,
            customer = customer,
            state = state,
            model = model,
            city = city,
            stepType = stepType,
            persona = persona,
            authenticatedUser = usrSvc.usr(),
            createdStartAt = createdStartAt,
            createdEndAt = createdEndAt
        )
    }

    @GetMapping( "/{persona}/occurrence-by-customer")
    fun getOccurrencesByCustomer(@PathVariable(required = true, name = "persona") persona: PersonaType,
                                 @RequestParam(required = false, name = "chassis") chassis: Optional<String>,
                                 @RequestParam(required = false, name = "criticality") criticality: Optional<Int>,
                                 @RequestParam(required = false, name = "createdStartAt") createdStartAt: Optional<LocalDate>,
                                 @RequestParam(required = false, name = "createdEndAt") createdEndAt: Optional<LocalDate>,
                                 @RequestParam(required = false, name = "updatedStartAt") updatedStartAt: Optional<LocalDate>,
                                 @RequestParam(required = false, name = "updatedEndAt") updatedEndAt: Optional<LocalDate>,
                                 @RequestParam(required = false, name = "dn") dn: Optional<String>,
                                 @RequestParam(required = false, name = "step") step: Optional<StepTypeOccurrence>,
                                 @RequestParam(required = false, name = "vehicle") vehicle: Optional<String>,
                                 @RequestParam(required = false, name = "emissionStandard") emissionStandard: Optional<String>,
                                 @RequestParam(required = false, name = "state") state: Optional<String>,
                                 @RequestParam(required = false, name = "city") city: Optional<String>): Map<String, List<Map<String, Any>>> {
        return ocurrenceAnalyticsService.getStatsByCustomer(persona,
            usrSvc.usr(),
            chassis.getOrNull(),
            criticality.getOrNull(),
            createdStartAt.getOrNull(),
            createdEndAt.getOrNull(),
            updatedStartAt.getOrNull(),
            updatedEndAt.getOrNull(),
            dn.getOrNull(),
            step.getOrNull(),
            vehicle.getOrNull(),
            emissionStandard.getOrNull(),
            state.getOrNull(),
            city.getOrNull(),)
    }

    @GetMapping( "/{persona}/stats-by-dealership")
    fun getOccurrencesByDealership(@PathVariable(required = true, name = "persona") persona: PersonaType,
                                 @RequestParam(required = false, name = "chassis") chassis: Optional<String>,
                                 @RequestParam(required = false, name = "criticality") criticality: Optional<Int>,
                                 @RequestParam(required = false, name = "createdStartAt") createdStartAt: Optional<LocalDate>,
                                 @RequestParam(required = false, name = "createdEndAt") createdEndAt: Optional<LocalDate>,
                                 @RequestParam(required = false, name = "updatedStartAt") updatedStartAt: Optional<LocalDate>,
                                 @RequestParam(required = false, name = "updatedEndAt") updatedEndAt: Optional<LocalDate>,
                                 @RequestParam(required = false, name = "dn") dn: Optional<String>,
                                 @RequestParam(required = false, name = "step") step: Optional<StepTypeOccurrence>,
                                 @RequestParam(required = false, name = "vehicle") vehicle: Optional<String>,
                                 @RequestParam(required = false, name = "emissionStandard") emissionStandard: Optional<String>,
                                 @RequestParam(required = false, name = "state") state: Optional<String>,
                                 @RequestParam(required = false, name = "city") city: Optional<String>): List<Map<String, Map<String, Any?>>> {
        return ocurrenceAnalyticsService.getStatsByDealership(persona,
            usrSvc.usr(),
            chassis.getOrNull(),
            criticality.getOrNull(),
            createdStartAt.getOrNull(),
            createdEndAt.getOrNull(),
            updatedStartAt.getOrNull(),
            updatedEndAt.getOrNull(),
            dn.getOrNull(),
            step.getOrNull(),
            vehicle.getOrNull(),
            emissionStandard.getOrNull(),
            state.getOrNull(),
            city.getOrNull(),)
    }

    private fun isGetFinishedOccurrence(httpServletRequest: HttpServletRequest) : Boolean  = httpServletRequest.requestURI.endsWith("finished")
    
    private fun getOccurrenceFilterType(httpServletRequest: HttpServletRequest) : OccurrenceFilterType {
        return when {
            httpServletRequest.requestURI.endsWith("finished") -> OccurrenceFilterType.FINISHED
            httpServletRequest.requestURI.endsWith("all") -> OccurrenceFilterType.ALL
            else -> OccurrenceFilterType.OPEN
        }
    }
}
