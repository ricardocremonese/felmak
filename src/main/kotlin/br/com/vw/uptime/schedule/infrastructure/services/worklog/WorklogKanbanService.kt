package br.com.vw.uptime.schedule.infrastructure.services.worklog

import br.com.vw.uptime.schedule.core.utils.LogPoint
import br.com.vw.uptime.schedule.entrypoint.responses.worklog.WorklogFieldChangeResponse
import br.com.vw.uptime.schedule.entrypoint.responses.worklog.WorklogKanbanResponse
import br.com.vw.uptime.schedule.infrastructure.entities.worklog.WorklogFieldChangeEntity
import br.com.vw.uptime.schedule.infrastructure.entities.worklog.WorklogKanbanEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.worklog.WorklogFieldChangeRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.worklog.WorklogKanbanRepository
import br.com.vw.uptime.schedule.infrastructure.services.occurence.StepTypeOccurrence
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class WorklogKanbanService(
    private val worklogKanbanRepository: WorklogKanbanRepository,
    private val worklogFieldChangeRepository: WorklogFieldChangeRepository
) {

    private val logPoint = LogPoint("WorklogKanbanService")

    /**
     * Registra uma alteração de etapa no Kanban
     */
    fun logStepChange(
        occurrenceId: Int,
        occurrenceUuid: String,
        step: StepTypeOccurrence,
        previousStatus: StepTypeOccurrence?,
        newStatus: StepTypeOccurrence,
        userId: String,
        userUuid: String? = null,
        userName: String? = null,
        description: String? = null
    ): WorklogKanbanEntity {
        return logPoint.log {
            val worklog = WorklogKanbanEntity(
                occurrenceId = occurrenceId,
                occurrenceUuid = occurrenceUuid,
                step = step,
                previousStatus = previousStatus,
                newStatus = newStatus,
                userId = userId,
                userUuid = userUuid,
                userName = userName,
                actionType = "STEP_CHANGE",
                description = description ?: "Etapa alterada de ${previousStatus?.description ?: "N/A"} para ${newStatus.description}"
            )
            
            worklogKanbanRepository.save(worklog)
        }
    }

    /**
     * Registra uma alteração de campo
     */
    fun logFieldChange(
        worklogKanbanId: Long,
        fieldName: String,
        oldValue: String?,
        newValue: String?,
        fieldType: String? = "STRING"
    ): WorklogFieldChangeEntity {
        return logPoint.log {
            val worklogKanban = worklogKanbanRepository.findById(worklogKanbanId)
                .orElseThrow { IllegalArgumentException("WorklogKanban with ID $worklogKanbanId not found") }
            
            val fieldChange = WorklogFieldChangeEntity(
                worklogKanban = worklogKanban,
                fieldName = fieldName,
                oldValue = oldValue,
                newValue = newValue,
                fieldType = fieldType
            )
            
            worklogFieldChangeRepository.save(fieldChange)
        }
    }

    /**
     * Registra múltiplas alterações de campos em uma única operação
     */
    fun logMultipleFieldChanges(
        occurrenceId: Int,
        occurrenceUuid: String,
        step: StepTypeOccurrence,
        userId: String,
        userUuid: String? = null,
        userName: String? = null,
        fieldChanges: Map<String, Pair<String?, String?>>
    ): WorklogKanbanEntity {
        return logPoint.log {
            // Primeiro cria o log principal
            val worklog = logStepChange(
                occurrenceId = occurrenceId,
                occurrenceUuid = occurrenceUuid,
                step = step,
                previousStatus = null,
                newStatus = step,
                userId = userId,
                userUuid = userUuid,
                userName = userName,
                description = "Alteração de ${fieldChanges.size} campo(s)"
            )

            // Depois registra cada alteração de campo
            fieldChanges.forEach { (fieldName, values) ->
                logFieldChange(
                    worklogKanbanId = worklog.id!!,
                    fieldName = fieldName,
                    oldValue = values.first,
                    newValue = values.second
                )
            }

            worklog
        }
    }

    /**
     * Busca logs de uma ocorrência específica
     */
    @Transactional(readOnly = true)
    fun getLogsByOccurrenceId(occurrenceId: Int): List<WorklogKanbanResponse> {
        return logPoint.log {
            val worklogs = worklogKanbanRepository.findByOccurrenceIdOrderByChangedAtDesc(occurrenceId)
            worklogs.map { it.toResponse() }
        }
    }

    /**
     * Busca logs de uma ocorrência por UUID
     */
    @Transactional(readOnly = true)
    fun getLogsByOccurrenceUuid(occurrenceUuid: String): List<WorklogKanbanResponse> {
        return logPoint.log {
            val worklogs = worklogKanbanRepository.findByOccurrenceUuidOrderByChangedAtDesc(occurrenceUuid)
            worklogs.map { it.toResponse() }
        }
    }

    /**
     * Busca logs de um usuário específico
     */
    @Transactional(readOnly = true)
    fun getLogsByUserId(userId: String, pageable: Pageable): Page<WorklogKanbanResponse> {
        return logPoint.log {
            worklogKanbanRepository.findByUserIdOrderByChangedAtDesc(userId, pageable)
                .map { it.toResponse() }
        }
    }

    /**
     * Busca logs em um período específico
     */
    @Transactional(readOnly = true)
    fun getLogsByDateRange(
        startDate: LocalDateTime,
        endDate: LocalDateTime,
        pageable: Pageable
    ): Page<WorklogKanbanResponse> {
        return logPoint.log {
            worklogKanbanRepository.findByDateRange(startDate, endDate, pageable)
                .map { it.toResponse() }
        }
    }

    /**
     * Busca logs de uma etapa específica
     */
    @Transactional(readOnly = true)
    fun getLogsByStep(step: StepTypeOccurrence, pageable: Pageable): Page<WorklogKanbanResponse> {
        return logPoint.log {
            worklogKanbanRepository.findByStepOrderByChangedAtDesc(step, pageable)
                .map { it.toResponse() }
        }
    }

    /**
     * Busca logs de uma ocorrência em uma etapa específica
     */
    @Transactional(readOnly = true)
    fun getLogsByOccurrenceAndStep(
        occurrenceId: Int,
        step: StepTypeOccurrence
    ): List<WorklogKanbanResponse> {
        return logPoint.log {
            val worklogs = worklogKanbanRepository.findByOccurrenceIdAndStepOrderByChangedAtDesc(occurrenceId, step)
            worklogs.map { it.toResponse() }
        }
    }

    /**
     * Extension function para converter entidade em response
     */
    private fun WorklogKanbanEntity.toResponse(): WorklogKanbanResponse {
        val fieldChanges = worklogFieldChangeRepository.findByWorklogKanbanIdOrderByChangedAtDesc(this.id!!)
            .map { fieldChange ->
                WorklogFieldChangeResponse(
                    id = fieldChange.id!!,
                    fieldName = fieldChange.fieldName,
                    oldValue = fieldChange.oldValue,
                    newValue = fieldChange.newValue,
                    fieldType = fieldChange.fieldType,
                    changedAt = fieldChange.changedAt
                )
            }

        return WorklogKanbanResponse(
            id = this.id!!,
            occurrenceId = this.occurrenceId,
            occurrenceUuid = this.occurrenceUuid,
            step = this.step,
            previousStatus = this.previousStatus,
            newStatus = this.newStatus,
            userId = this.userId,
            userUuid = this.userUuid,
            userName = this.userName,
            changedAt = this.changedAt,
            actionType = this.actionType,
            description = this.description,
            fieldChanges = fieldChanges
        )
    }
}
