package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.entrypoint.responses.worklog.WorklogKanbanResponse
import br.com.vw.uptime.schedule.infrastructure.services.occurence.StepTypeOccurrence
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.worklog.WorklogKanbanService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

/**
 * Controller para gerenciar logs de alteração do Kanban
 * Fornece endpoints para consultar histórico de alterações de etapas e campos
 */
@RestController
@RequestMapping("/v1/worklog-kanban")
class WorklogKanbanController(
    private val worklogKanbanService: WorklogKanbanService,
    private val userAuthService: UserAuthServiceImpl
) {

    /**
     * Busca logs de uma ocorrência específica por ID
     */
    @GetMapping("/occurrence/{occurrenceId}", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getLogsByOccurrenceId(@PathVariable("occurrenceId") occurrenceId: Int): List<WorklogKanbanResponse> {
        return worklogKanbanService.getLogsByOccurrenceId(occurrenceId)
    }

    /**
     * Busca logs de uma ocorrência específica por UUID
     */
    @GetMapping("/occurrence/uuid/{occurrenceUuid}", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getLogsByOccurrenceUuid(@PathVariable("occurrenceUuid") occurrenceUuid: String): List<WorklogKanbanResponse> {
        return worklogKanbanService.getLogsByOccurrenceUuid(occurrenceUuid)
    }

    /**
     * Busca logs de uma ocorrência em uma etapa específica
     */
    @GetMapping("/occurrence/{occurrenceId}/step/{step}", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getLogsByOccurrenceAndStep(
        @PathVariable("occurrenceId") occurrenceId: Int,
        @PathVariable("step") step: StepTypeOccurrence
    ): List<WorklogKanbanResponse> {
        return worklogKanbanService.getLogsByOccurrenceAndStep(occurrenceId, step)
    }

    /**
     * Busca logs de um usuário específico (paginado)
     */
    @GetMapping("/user/{userId}", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getLogsByUserId(
        @PathVariable("userId") userId: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): Page<WorklogKanbanResponse> {
        val pageable: Pageable = PageRequest.of(page, size)
        return worklogKanbanService.getLogsByUserId(userId, pageable)
    }

    /**
     * Busca logs do usuário autenticado (paginado)
     */
    @GetMapping("/user/me", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getMyLogs(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): Page<WorklogKanbanResponse> {
        val currentUser = userAuthService.usr()
        val pageable: Pageable = PageRequest.of(page, size)
        return worklogKanbanService.getLogsByUserId(currentUser.userId, pageable)
    }

    /**
     * Busca logs em um período específico (paginado)
     */
    @GetMapping("/date-range", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getLogsByDateRange(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) startDate: LocalDateTime,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) endDate: LocalDateTime,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): Page<WorklogKanbanResponse> {
        val pageable: Pageable = PageRequest.of(page, size)
        return worklogKanbanService.getLogsByDateRange(startDate, endDate, pageable)
    }

    /**
     * Busca logs de uma etapa específica (paginado)
     */
    @GetMapping("/step/{step}", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getLogsByStep(
        @PathVariable("step") step: StepTypeOccurrence,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): Page<WorklogKanbanResponse> {
        val pageable: Pageable = PageRequest.of(page, size)
        return worklogKanbanService.getLogsByStep(step, pageable)
    }

    /**
     * Busca logs recentes (últimas 24 horas) do usuário autenticado
     */
    @GetMapping("/recent", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getRecentLogs(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): Page<WorklogKanbanResponse> {
        val currentUser = userAuthService.usr()
        val endDate = LocalDateTime.now()
        val startDate = endDate.minusDays(1)
        val pageable: Pageable = PageRequest.of(page, size)
        
        return worklogKanbanService.getLogsByDateRange(startDate, endDate, pageable)
    }
}
