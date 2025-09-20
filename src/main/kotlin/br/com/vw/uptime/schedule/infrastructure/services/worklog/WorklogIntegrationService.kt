package br.com.vw.uptime.schedule.infrastructure.services.worklog

import br.com.vw.uptime.schedule.core.utils.LogPoint
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.OccurrenceEntity
import br.com.vw.uptime.schedule.infrastructure.services.occurence.StepTypeOccurrence
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Service para integrar o sistema de worklog com as operações existentes
 * Este service deve ser chamado quando houver alterações nas ocorrências
 */
@Service
@Transactional
class WorklogIntegrationService(
    private val worklogKanbanService: WorklogKanbanService
) {

    private val logPoint = LogPoint("WorklogIntegrationService")

    /**
     * Registra uma alteração de etapa de uma ocorrência
     */
    fun logOccurrenceStepChange(
        occurrence: OccurrenceEntity,
        previousStep: StepTypeOccurrence?,
        newStep: StepTypeOccurrence,
        userId: String,
        userUuid: String? = null,
        userName: String? = null,
        description: String? = null
    ) {
        logPoint.log {
            worklogKanbanService.logStepChange(
                occurrenceId = occurrence.id!!,
                occurrenceUuid = occurrence.uuid,
                step = newStep,
                previousStatus = previousStep,
                newStatus = newStep,
                userId = userId,
                userUuid = userUuid,
                userName = userName,
                description = description
            )
        }
    }

    /**
     * Registra alterações de campos de uma ocorrência
     */
    fun logOccurrenceFieldChanges(
        occurrence: OccurrenceEntity,
        fieldChanges: Map<String, Pair<String?, String?>>,
        userId: String,
        userUuid: String? = null,
        userName: String? = null
    ) {
        logPoint.log {
            if (fieldChanges.isNotEmpty()) {
                worklogKanbanService.logMultipleFieldChanges(
                    occurrenceId = occurrence.id!!,
                    occurrenceUuid = occurrence.uuid,
                    step = occurrence.currentStep,
                    userId = userId,
                    userUuid = userUuid,
                    userName = userName,
                    fieldChanges = fieldChanges
                )
            }
        }
    }

    /**
     * Registra uma movimentação de card no Kanban
     */
    fun logCardMovement(
        occurrence: OccurrenceEntity,
        fromStep: StepTypeOccurrence?,
        toStep: StepTypeOccurrence,
        userId: String,
        userUuid: String? = null,
        userName: String? = null,
        reason: String? = null
    ) {
        logPoint.log {
            worklogKanbanService.logStepChange(
                occurrenceId = occurrence.id!!,
                occurrenceUuid = occurrence.uuid,
                step = toStep,
                previousStatus = fromStep,
                newStatus = toStep,
                userId = userId,
                userUuid = userUuid,
                userName = userName,
                description = reason ?: "Card movido de ${fromStep?.description ?: "N/A"} para ${toStep.description}"
            )
        }
    }

    /**
     * Registra uma atualização geral de uma ocorrência
     */
    fun logOccurrenceUpdate(
        occurrence: OccurrenceEntity,
        previousOccurrence: OccurrenceEntity?,
        userId: String,
        userUuid: String? = null,
        userName: String? = null
    ) {
        logPoint.log {
            val fieldChanges = mutableMapOf<String, Pair<String?, String?>>()

            // Compara campos principais e registra alterações
            if (previousOccurrence != null) {
                if (previousOccurrence.currentStep != occurrence.currentStep) {
                    fieldChanges["currentStep"] = Pair(
                        previousOccurrence.currentStep.name,
                        occurrence.currentStep.name
                    )
                }

                if (previousOccurrence.criticality != occurrence.criticality) {
                    fieldChanges["criticality"] = Pair(
                        previousOccurrence.criticality?.toString(),
                        occurrence.criticality?.toString()
                    )
                }

                if (previousOccurrence.osNumber != occurrence.osNumber) {
                    fieldChanges["osNumber"] = Pair(
                        previousOccurrence.osNumber,
                        occurrence.osNumber
                    )
                }

                if (previousOccurrence.renter != occurrence.renter) {
                    fieldChanges["renter"] = Pair(
                        previousOccurrence.renter,
                        occurrence.renter
                    )
                }

                if (previousOccurrence.literatureTroubleshooting != occurrence.literatureTroubleshooting) {
                    fieldChanges["literatureTroubleshooting"] = Pair(
                        previousOccurrence.literatureTroubleshooting,
                        occurrence.literatureTroubleshooting
                    )
                }

                if (previousOccurrence.occurrenceType != occurrence.occurrenceType) {
                    fieldChanges["occurrenceType"] = Pair(
                        previousOccurrence.occurrenceType,
                        occurrence.occurrenceType
                    )
                }

                if (previousOccurrence.tasNumber != occurrence.tasNumber) {
                    fieldChanges["tasNumber"] = Pair(
                        previousOccurrence.tasNumber,
                        occurrence.tasNumber
                    )
                }

                if (previousOccurrence.tasStatus != occurrence.tasStatus) {
                    fieldChanges["tasStatus"] = Pair(
                        previousOccurrence.tasStatus,
                        occurrence.tasStatus
                    )
                }
            }

            // Se há alterações de campos, registra
            if (fieldChanges.isNotEmpty()) {
                logOccurrenceFieldChanges(
                    occurrence = occurrence,
                    fieldChanges = fieldChanges,
                    userId = userId,
                    userUuid = userUuid,
                    userName = userName
                )
            }
        }
    }
}
