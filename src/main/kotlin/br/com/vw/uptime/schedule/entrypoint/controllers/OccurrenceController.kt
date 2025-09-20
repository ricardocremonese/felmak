package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.core.enums.PersonaType
import br.com.vw.uptime.schedule.entrypoint.requests.occurrence.*
import br.com.vw.uptime.schedule.entrypoint.responses.occurrence.*
import br.com.vw.uptime.schedule.infrastructure.mappers.OccurrenceMapper
import br.com.vw.uptime.schedule.infrastructure.services.assistance.ChassisValidationResponse
import br.com.vw.uptime.schedule.infrastructure.services.assistance.OccurrenceDynamicsService
import br.com.vw.uptime.schedule.infrastructure.services.occurence.*
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.util.*
import kotlin.jvm.optionals.getOrNull


@RestController
@RequestMapping("/v1/occurrence")
class OccurrenceController(
    private val occurrenceAddService: OccurrenceAddService,
    private val usrSvc:UserAuthServiceImpl,
    private val occurrenceService: OccurrenceService,
    private val occurrenceUpdateService: OccurrenceUpdateService,
    private val occurrenceMapper: OccurrenceMapper,
    private val occurrenceUpdateStepService: OccurrenceStepService,
    private val occurrenceDynamicsService: OccurrenceDynamicsService,
    private val occurrenceImportService: OccurrenceImportService
)
{
    @PostMapping
    fun add(
        @RequestBody @Validated occurrenceAddRequest: OccurrenceAddRequest,
        @RequestParam(required = false, defaultValue = "true", name = "saveInDynamics") saveInDynamics: Boolean
    ): Occurrence {
        return occurrenceAddService.create(occurrenceAddRequest, usrSvc.usr(), saveInDynamics)
    }

    @PostMapping("/batch")
    fun addBatch(
        @RequestParam(required = false, defaultValue = "false", name = "replace_existing") replaceExisting: Boolean,
        @RequestBody @Validated occurrenceImportDataBatchRequest: OccurrenceImportDataBatchRequest
    ): OccurrenceBatchImportResult {
        return occurrenceImportService.importBatch(occurrenceImportDataBatchRequest, replaceExisting)
    }

    @DeleteMapping("/batch")
    fun deleteBatch(@RequestBody @Validated occurrenceImportDataBatchRequest: OccurrenceImportDataBatchRequest): OccurrenceBatchImportResult {
        return occurrenceImportService.deleteBatch(occurrenceImportDataBatchRequest)
    }

    @PutMapping("/{uuid}")
    fun update(
        @PathVariable("uuid") occurrenceUuid: String,
        @RequestBody @Validated occurrenceAddRequest: OccurrenceUpdateRequest
    ): OccurrenceResponse {
        return occurrenceUpdateService.update(occurrenceUuid, occurrenceAddRequest, usrSvc.usr())
    }

    @PutMapping("/{occurrenceUuid}/step/{stepType}")
    fun changeStep(
        @PathVariable("occurrenceUuid") occurrenceUuid:String,
        @PathVariable("stepType") targetStepType:StepTypeOccurrence
    ): UpdateStepChangeResponse {
        return occurrenceUpdateStepService.updateStep(
            occurrenceUuid,
            OccurrenceStepChangeRequest().apply {
                this.targetStepType = targetStepType
            }
        )
    }

    @PutMapping("/{occurrenceUuid}/step/{stepId}/to/{stepType}")
    fun updateStep(
        @PathVariable("occurrenceUuid") occurrenceUuid:String,
        @PathVariable("stepId") stepId:Int,
        @PathVariable("stepType") targetStepType:StepTypeOccurrence
    ): OccurrenceResponse {
        val user = usrSvc.usr()
        val occurrenceUpdated = occurrenceUpdateStepService.changeOccurrenceStep(
            occurrenceUuid,
            stepId,
            targetStepType,
            user
        )
        return occurrenceMapper.toResponse(occurrenceUpdated)
    }

    @PutMapping("/{occurrenceUuid}/finalized")
    fun finalizeStep(
        @PathVariable("occurrenceUuid") occurrenceUuid:String,
        @RequestBody(required = false) finalizeRequest: FinalizeOccurrenceRequest? = null
    ): FinalizeOccurrenceResponse {
        return occurrenceUpdateStepService.finalizeOccurrence(
            occurrenceUuid,
            finalizeRequest
        )
    }

    @PostMapping(path = ["/list/{persona}", "/list/{persona}/finished", "/list/{persona}/all"])
    fun getOccurrencesWithFilter(
        @PathVariable(required = true, name = "persona") persona: PersonaType,
        @RequestParam(required = false, defaultValue = "0", name = "page") page: Int,
        @RequestParam(required = false, defaultValue = "20", name = "size") size: Int,
        @RequestParam(required = false, name = "criticality") criticality: Optional<Int>?,
        @RequestParam(required = false, name = "createdStartAt") createdStartAt: Optional<LocalDate>?,
        @RequestParam(required = false, name = "createdEndAt") createdEndAt: Optional<LocalDate>?,
        @RequestParam(required = false, name = "updatedStartAt") updatedStartAt: Optional<LocalDate>?,
        @RequestParam(required = false, name = "updatedEndAt") updatedEndAt: Optional<LocalDate>?,
        @RequestParam(required = false, name = "occurrenceType") occurrenceType: Optional<List<OccurrenceType>>?,
        @RequestParam(required = false, name = "createdByUuid") createdByUuid: Optional<String>?,
        @RequestParam(required = false, name = "dealershipDn") dealershipDn: Optional<List<String>>?,
        @RequestParam(required = false, name = "hasCampaigns") hasCampaigns: Optional<Boolean>?,
        @RequestParam(required = false, name = "isAlert", defaultValue = "false") isAlert: Boolean,
        @RequestParam(required = false, name = "stepType") stepType: Optional<StepTypeOccurrence>?,
        @RequestBody(required = false) occurrenceRequestList: OccurrenceRequestList?,
        httpServletRequest: HttpServletRequest) : OccurrencePaginatedResponse {

        return occurrenceService.getOccurrenceByFilters(
            persona,
            page,
            size,
            usrSvc.usr(),
            criticality?.getOrNull(),
            createdStartAt?.getOrNull(),
            createdEndAt?.getOrNull(),
            updatedStartAt?.getOrNull(),
            updatedEndAt?.getOrNull(),
            occurrenceType?.getOrNull(),
            createdByUuid?.getOrNull(),
            dealershipDn?.getOrNull(),
            hasCampaigns?.getOrNull(),
            isAlert,
            occurrenceRequestList ?: OccurrenceRequestList(),
            getOccurrenceFilterType(httpServletRequest),
            stepType?.getOrNull())
    }

    @PostMapping(path = ["/list/{persona}/by-schedule-ids", "/list/{persona}/by-schedule-ids/finished", "/list/{persona}/by-schedule-ids/all"])
    fun getOccurrencesWithFilterAndScheduleIds(
        @PathVariable(required = true, name = "persona") persona: PersonaType,
        @RequestBody(required = false) occurrenceRequestList: OccurrenceRequestListWithScheduleIds,
        httpServletRequest: HttpServletRequest,) : List<OccurrenceInfoResponse> {

        return occurrenceService.getOccurrenceByFiltersWithScheduleIds(persona,
            usrSvc.usr(),
            occurrenceRequestList,
            getOccurrenceFilterType(httpServletRequest))
    }

    @GetMapping("/{persona}/{uuid}")
    fun getOccurrence(@PathVariable("uuid") uuid: String): OccurrenceResponse {
        val occurrenceEntity = occurrenceService.getOccurrence(uuid)
        return occurrenceMapper.toResponse(occurrenceEntity)
    }

    @GetMapping("/review/{uuid}")
    fun getReview(@PathVariable("uuid") uuid: String): List<OccurrenceReviewResponse> = occurrenceService.getReviews(uuid)


    @PostMapping("/review/{uuid}/{step}")
    fun createReview(@PathVariable("uuid") uuid: String,
                     @PathVariable("step") step: StepTypeOccurrence,
                     @RequestBody @Validated occurrenceReviewRequest: OccurrenceReviewRequest) =
        occurrenceService.createReview(uuid, step, occurrenceReviewRequest)


    @PostMapping("/{occurrenceUuid}/dispatch")
    fun createDispatch(@PathVariable("occurrenceUuid") occurrenceUuid: String,
                       @RequestBody @Validated createDispatchRequest: CreateDispatchRequest): OccurrenceDispatchResponse {
        val dispatch = occurrenceService.createDispatch(occurrenceUuid, createDispatchRequest)
        return occurrenceMapper.toDispatchResponse(dispatch)
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PutMapping("/{occurrenceUuid}/dispatch/{dispatchUuid}/cancel")
    fun cancelDispatch(@PathVariable("occurrenceUuid") occurrenceUuid: String,
                       @PathVariable("dispatchUuid") dispatchUuid: String,
                       @RequestBody @Validated cancelDispatchRequest: CancelDispatchRequest) =
        occurrenceService.cancelDispatch(occurrenceUuid, dispatchUuid, cancelDispatchRequest)

    @PutMapping("/{occurrenceUuid}/dispatch/{dispatchUuid}/available")
    fun makeDispatchAvailable(@PathVariable("occurrenceUuid") occurrenceUuid: String,
                              @PathVariable("dispatchUuid") dispatchUuid: String) =
        occurrenceService.makeDispatchAvailable(occurrenceUuid, dispatchUuid)

    @PutMapping("/{occurrenceUuid}/dispatch/{dispatchUuid}/driver")
    fun assignDriverToDispatch(@PathVariable("occurrenceUuid") occurrenceUuid: String,
                              @PathVariable("dispatchUuid") dispatchUuid: String,
                              @RequestBody @Validated assignDriverToDispatchRequest: AssignDriverToDispatchRequest) =
        occurrenceService.assignDriverToDispatch(occurrenceUuid, dispatchUuid, assignDriverToDispatchRequest)

    @GetMapping("/{persona}/stats")
    fun getStats(@PathVariable("persona") persona: PersonaType): OccurrenceStatsResponse {
        return occurrenceService.getStats(usrSvc.usr(), persona)
    }

    @PostMapping("/list/{persona}/time-spent")
    fun getOccurrencesWithMinutes(
        @PathVariable(required = true, name = "persona") persona: PersonaType,
        @RequestParam(required = false, name = "criticality") criticality: Optional<Int>?,
        @RequestParam(required = false, name = "createdStartAt") createdStartAt: Optional<LocalDate>?,
        @RequestParam(required = false, name = "createdEndAt") createdEndAt: Optional<LocalDate>?,
        @RequestParam(required = false, name = "updatedStartAt") updatedStartAt: Optional<LocalDate>?,
        @RequestParam(required = false, name = "updatedEndAt") updatedEndAt: Optional<LocalDate>?,
        @RequestParam(required = false, name = "occurrenceType") occurrenceType: Optional<List<OccurrenceType>>?,
        @RequestParam(required = false, name = "createdByUuid") createdByUuid: Optional<String>?,
        @RequestParam(required = false, name = "dealershipDn") dealershipDn: Optional<List<String>>,
        @RequestParam(required = false, name = "hasCampaigns") hasCampaigns: Optional<Boolean>?,
        @RequestParam(required = false, name = "stepType") stepType: Optional<StepTypeOccurrence>?,
        @RequestBody(required = false) occurrenceRequestList: OccurrenceRequestList,
        httpServletRequest: HttpServletRequest,
    ): List<OccurrenceWithMinutesResponse> {
        return occurrenceService.getOccurrencesWithMinutes(
            persona,
            usrSvc.usr(),
            criticality?.getOrNull(),
            createdStartAt?.getOrNull(),
            createdEndAt?.getOrNull(),
            updatedStartAt?.getOrNull(),
            updatedEndAt?.getOrNull(),
            occurrenceType?.getOrNull(),
            createdByUuid?.getOrNull(),
            dealershipDn.getOrNull(),
            hasCampaigns?.getOrNull(),
            occurrenceRequestList,
            stepType?.getOrNull(),
            getOccurrenceFilterType(httpServletRequest)
        )
    }

    @GetMapping("/validate-chassis/{chassis}")
    fun validateChassisForOccurrence(@PathVariable("chassis") chassis: String): ChassisValidationResponse {
        return occurrenceDynamicsService.validateChassis(chassis)
    }

    @PostMapping("/validate-chassis/batch")
    fun validateChassisBatch(@RequestBody request: ChassisValidationBatchRequest): List<ChassisValidationResponse> {
        return request.chassisList.map { chassis ->
            occurrenceDynamicsService.validateChassis(chassis)
        }
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

class OccurrenceRequestList {
    var chassisList:List<String> = listOf()
}

class OccurrenceRequestListWithScheduleIds {
    var scheduleIds:List<String> = listOf()
}

enum class OccurrenceFilterType {
    OPEN,
    FINISHED,
    ALL
}

class ChassisValidationBatchRequest {
    var chassisList: List<String> = listOf()
}