package br.com.vw.uptime.schedule.infrastructure.services.occurence

import br.com.vw.uptime.schedule.entrypoint.requests.occurrence.OccurrenceImportDataBatchRequest
import br.com.vw.uptime.schedule.entrypoint.requests.occurrence.toOccurrenceAddRequest
import br.com.vw.uptime.schedule.entrypoint.requests.occurrence.toOccurrenceUpdateRequest
import br.com.vw.uptime.schedule.infrastructure.entities.dealership.DealershipEntity
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.OccurrenceStepEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.dealerships.DealershipRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.OccurrenceRepository
import br.com.vw.uptime.schedule.infrastructure.services.dealership.DealershipServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class OccurrenceImportService(
    private val occurrenceAddService: OccurrenceAddService,
    private val occurrenceUpdateService: OccurrenceUpdateService,
    private val occurrenceDeleteService: OccurrenceDeleteService,
    private val occurrenceRepository: OccurrenceRepository,
    private val userAuthService: UserAuthServiceImpl,
    private val dealershipService: DealershipServiceImpl,
    private val dealershipRepository: DealershipRepository
) {
    /**
     * Importa um lote de ocorrências a partir de um request batch.
     * Retorna uma lista de resultados de importação, podendo ser expandido para detalhar erros/sucessos.
     */
    fun importBatch(batchRequest: OccurrenceImportDataBatchRequest, replaceExisting: Boolean): OccurrenceBatchImportResult {
        val results = batchRequest.occurrences
            .filter { it.numeroOcorrencia != null }
            .mapIndexed { index, importData ->
            println("Importando ocorrência: ${importData.numeroOcorrencia}: $index / ${batchRequest.occurrences.size}")
            var occurrenceUuid: String? = null
            try {

                val existingOccurrence = occurrenceRepository.getOccurrenceByOsNumber(importData.numeroOcorrencia)

                if(existingOccurrence != null && replaceExisting) {
                    occurrenceDeleteService.deleteByUuid(existingOccurrence.uuid)
                } else if(existingOccurrence != null) {
                    throw IllegalArgumentException("Ocorrência já existe: ${importData.numeroOcorrencia}")
                }

                // Verificar e criar dealership se necessário
                ensureDealershipExists(importData.codigoDn?.toString())
                
                val addRequest = importData.toOccurrenceAddRequest()
                val occurrence = occurrenceAddService.create(addRequest, usr = userAuthService.usr(), saveInDynamics = false)
                occurrenceUuid = occurrence.uuid
                val updateRequest = importData.toOccurrenceUpdateRequest()
                occurrenceUpdateService.update(occurrence.uuid, updateRequest, userAuthService.usr())

                // Abrir a etapa baseada no campo Etapa Kanban
                openStepByKanbanStage(occurrence.uuid, importData.etapaKanban)

                println("Ocorrência importada com sucesso: id=${importData.id}, uuid=${occurrence.uuid}, numeroOcorrencia=${importData.numeroOcorrencia}")

                OccurrenceImportResult(
                    id = importData.id,
                    success = true,
                    occurrenceUuid = occurrence.uuid,
                    error = null
                )
            } catch (ex: Exception) {
                println("Erro ao importar ocorrência: ${importData.numeroOcorrencia}: $index / ${batchRequest.occurrences.size}: $ex")
                
                // Deletar a ocorrência criada
                if (occurrenceUuid != null) {
                    occurrenceDeleteService.deleteByUuid(occurrenceUuid)
                }
                OccurrenceImportResult(
                    id = importData.id,
                    success = false,
                    occurrenceUuid = null,
                    error = ex.message
                )
            }
        }
        return OccurrenceBatchImportResult(results)
    }

    fun deleteBatch(batchRequest: OccurrenceImportDataBatchRequest): OccurrenceBatchImportResult {
        val results = batchRequest.occurrences.map { importData ->
            println("Deletando ocorrência: ${importData.numeroOcorrencia}")
            try {
                if(importData.numeroOcorrencia == null) {
                    throw IllegalArgumentException("Número da ocorrência é obrigatório")
                }
                
                val occurrence = occurrenceRepository.getOccurrenceByOsNumber(importData.numeroOcorrencia)
                if (occurrence != null) {
                    occurrenceDeleteService.deleteByUuid(occurrence.uuid)
                }

                println("Ocorrência deletada com sucesso: id=${importData.id}, numeroOcorrencia=${importData.numeroOcorrencia}")
                OccurrenceImportResult(
                    id = importData.id,
                    success = true,
                    occurrenceUuid = null,
                    error = null
                )
            } catch (ex: Exception) {
                println("Erro ao deletar ocorrência: ${importData.numeroOcorrencia}: $ex")
                OccurrenceImportResult(
                    id = importData.id,
                    success = false,
                    occurrenceUuid = null,
                    error = ex.message
                )
            }
        }
        return OccurrenceBatchImportResult(results)
    }

    /**
     * Verifica se o dealership existe e o cria caso não exista
     */
    private fun ensureDealershipExists(dn: String?) {
        if (dn.isNullOrBlank()) {
            throw IllegalArgumentException("DN do dealership é obrigatório")
        }
        
        try {
            dealershipService.dealershipById(dn)
        } catch (ex: Exception) {
            // Se não existe, cria um novo dealership
            createDealership(dn)
        }
    }

    /**
     * Cria um novo dealership com dados básicos
     */
    private fun createDealership(dn: String) {
        val dealershipEntity = DealershipEntity().apply {
            this.dn = dn
            fantasyName = "Dealership $dn"
            address = "Endereço não informado"
            city = "Cidade não informada"
            state = "Estado não informado"
            telephone = "Telefone não informado"
            regional = "Regional não informada"
        }
        
        dealershipRepository.save(dealershipEntity)
    }

    @Transactional
    private fun openStepByKanbanStage(occurrenceUuid: String, etapaKanban: String?) {
        val occurrence = occurrenceRepository.getOccurrenceByUuid(occurrenceUuid)
            ?: throw RuntimeException("Ocorrência não encontrada: $occurrenceUuid")
        
        val targetStep = mapKanbanStepToStepType(etapaKanban)
    
        // Verificar se já existe um step com o mesmo stepId
        val existingStep = occurrence.occurrenceSteps.find { it.stepId == targetStep }
    
        if (existingStep == null) {
            // Criar novo step
            val stepDtStart = LocalDateTime.now()
            val newStep = OccurrenceStepEntity().apply {
                stepId = targetStep
                observation = "Etapa aberta automaticamente baseada no Kanban: $etapaKanban"
                dtStart = stepDtStart
                latest = 1
                this.occurrence = occurrence
            }

            occurrence.occurrenceSteps.add(newStep)

            // Atualizar a data final do step anterior TICKET
            val previousStep = occurrence.occurrenceSteps.find { it.stepId == StepTypeOccurrence.TICKE }
            if (previousStep != null) {
                previousStep.dtEnd = stepDtStart
            }

            occurrence.currentStep = targetStep
        
            occurrenceRepository.save(occurrence)
        } else {
            // Step já existe, apenas atualizar a ocorrência para esta etapa
            occurrence.currentStep = targetStep
            occurrenceRepository.save(occurrence)
        }
    }

    private fun mapKanbanStepToStepType(etapaKanban: String?): StepTypeOccurrence {
        return when (etapaKanban?.trim()) {
            "09 - Ag. Ok Cliente" -> StepTypeOccurrence.OKCLI
            "11 - Reparo" -> StepTypeOccurrence.REPAIR
            "08 - Peças em Trânsito" -> StepTypeOccurrence.PARINTR
            "07 - Peças" -> StepTypeOccurrence.PARTS
            "04 - Diagnóstico" -> StepTypeOccurrence.DIAG2
            "06 - Tratativa Garantia" -> StepTypeOccurrence.ANGAR
            else -> StepTypeOccurrence.TICKE
        }
    }
}

data class OccurrenceBatchImportResult(
    val results: List<OccurrenceImportResult>
)

data class OccurrenceImportResult(
    val id: Int?,
    val success: Boolean,
    val occurrenceUuid: String?,
    val error: String?
) 