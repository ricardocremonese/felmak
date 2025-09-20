package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.infrastructure.services.assistance.AssistanceService
import br.com.vw.uptime.schedule.infrastructure.services.assistance.OccurrenceDynamicsService
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("v1/assistance")
class AssistanceController(
    val assistanceService: AssistanceService,
    val occurrenceDynamicsService: OccurrenceDynamicsService,
    private val userAuthServiceImpl: UserAuthServiceImpl
) {
/*
    @PostMapping
    fun create(@RequestBody @Validated assistanceCreationRequest: AssistanceCreationRequest) : AssistanceResponse {
        return assistanceService.createAssistance(assistanceCreationRequest)
    }

    @PutMapping("/{assistanceId}")
    fun updateAssistance(
        @PathVariable("assistanceId") assistanceId: String,
        @RequestBody @Validated assistanceUpdateRequest: AssistanceUpdateRequest
    ): AssistanceResponse {
        return assistanceService.updateAssistance(assistanceId, assistanceUpdateRequest)
    }

    @PostMapping("/by-chassis-list")
    fun list(
        @RequestParam("page", defaultValue = "1") page:Int,
        @RequestParam("limit", defaultValue = "20") limit:Int,
        @RequestParam("sortDirection", defaultValue = "desc") sortDirection:String,
        @RequestParam("queryChassis", defaultValue = "") queryChassis:String,
        @RequestParam("date", defaultValue = "") date:String,
    ) : List<AssistanceListItem> {
        return assistanceService.listAssistanceListByChassisList(
            page = page,
            limit = limit,
            sortDirection =  sortDirection,
            queryChassis = queryChassis,
            date = date
        )
    }

    @PostMapping("/{assistanceId}/finished")
    fun finishAssistance(
        @PathVariable("assistanceId") assistanceId: String
    ) {
        assistanceService.finishAssistance(assistanceId)
    }

    @GetMapping("/{assistanceId}")
    fun getAssistanceById(@PathVariable("assistanceId") assistanceId: String) : AssistanceResponse {
        return assistanceService.getAssistanceById(assistanceId)
    }

    @GetMapping
    fun getAssistanceList(
        @RequestParam("lastKey") lastKey:String?,
        @RequestParam("limit", defaultValue = "20") limit:Int,
        @RequestParam("sortDirection", defaultValue = "desc") sortDirection:String,
        @RequestParam("queryChassis", defaultValue = "") queryChassis:String,
        @RequestParam("date", defaultValue = "") date:String,
        @RequestParam("state", defaultValue = "PD") state:AssistanceStateEnum,
    ): Page<AssistanceListItem> {
        return assistanceService.listAssistance(
            lastKey = lastKey,
            limit = limit,
            sortDirection = sortDirection,
            queryChassis = queryChassis,
            date = date,
            state = state
        )
    }

    @GetMapping("/occur-assist")
    fun getAssistanceTypeAssistance(
        @RequestParam("lastKey") lastKey:String?,
        @RequestParam("limit", defaultValue = "20") limit:Int,
        @RequestParam("sortDirection", defaultValue = "desc") sortDirection:String,
        @RequestParam("queryChassis", defaultValue = "") queryChassis:String,
        @RequestParam("date", defaultValue = "") date:String,
        @RequestParam("state") state:AssistanceStateEnum?,
    ): Page<AssistanceListItem> {
        return assistanceService.getOccurrenceTypeAssistanceList(
            state = state,
            date = date,
            limit = limit,
            encodedLastKey = lastKey,
            sortDirection = sortDirection
        )
    }

    @GetMapping("/occur-winch")
    fun getAssistanceTypeWinch(
        @RequestParam("lastKey") lastKey:String?,
        @RequestParam("limit", defaultValue = "20") limit:Int,
        @RequestParam("sortDirection", defaultValue = "desc") sortDirection:String,
        @RequestParam("queryChassis", defaultValue = "") queryChassis:String,
        @RequestParam("date", defaultValue = "") date:String,
        @RequestParam("state") state:AssistanceStateEnum?,
    ): Page<AssistanceListItem> {
        return assistanceService.getOccurrenceTypeWinchList(
            state = state,
            date = date,
            limit = limit,
            encodedLastKey = lastKey,
            sortDirection = sortDirection
        )
    }

    @PostMapping("/{assistanceId}/assign-dispatch")
    fun assignDispatch(@PathVariable("assistanceId") assistanceId:String,
        @RequestBody assignDispatchRequest: AssistanceDispatchRequest
    ): AssistanceResponse {
        return assistanceService.assignDispatch(assistanceId, assignDispatchRequest)
    }

    @PostMapping("/{assistanceId}/dispatch/cancel")
    fun cancel(@PathVariable("assistanceId") assistanceId: String, @RequestBody @Validated cancelRequest: AssistanceDispatchCancelRequest) {
        assistanceService.cancel(assistanceId, cancelRequest)
    }

    @GetMapping("/{assistanceId}/history")
    fun assistanceHistory(@PathVariable("assistanceId") assistanceId: String): List<AssistanceHistoryResponse> {
        return assistanceService.getAssistanceHistory(assistanceId)
    }

    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/{assistanceId}/dispatch/create-step")
    fun createDispatchStep(@PathVariable("assistanceId") assistanceId: String, @RequestBody dispatchStepRequest: DispatchStepRequest) : DispatchStepResponse {
        return assistanceService.createDispatchStep(assistanceId, dispatchStepRequest)
    }

    @ResponseStatus(HttpStatus.OK)
    @PutMapping("/{assistanceId}/dispatch/{stepUuid}")
    fun updateDispatchStep(@PathVariable("assistanceId") assistanceId: String, @PathVariable("stepUuid") stepUuid: String, @RequestBody @Validated dispatchStepRequest: DispatchStepRequest) {
        assistanceService.updateDispatchStep(assistanceId, stepUuid, dispatchStepRequest)
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{assistanceId}/dispatch/{stepUuid}")
    fun deleteDispatchStep(@PathVariable("assistanceId") assistanceId: String, @PathVariable("stepUuid") stepUuid: String) {
        assistanceService.deleteDispatchStep(assistanceId, stepUuid)
    }

 */
}