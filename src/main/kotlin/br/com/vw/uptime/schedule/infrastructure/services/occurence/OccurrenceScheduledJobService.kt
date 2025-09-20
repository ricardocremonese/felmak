package br.com.vw.uptime.schedule.infrastructure.services.occurence

import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.OccurrenceRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.OccurrenceStepRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.users.User
import br.com.vw.uptime.schedule.infrastructure.services.user.UsersServiceImpl
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.*
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.temporal.ChronoUnit

@Service
class OccurrenceScheduledJobService(
    private val occurrenceRepository: OccurrenceRepository,
    private val occurrenceStepRepository: OccurrenceStepRepository,
    private val usersServiceImpl: UsersServiceImpl
) {

    private val logger = LoggerFactory.getLogger(OccurrenceScheduledJobService::class.java)

    /**
     * Job para verificar ocorrências criadas nos últimos 30 minutos sem steps
     * e abrir automaticamente o step TICKE (Chamado) para elas
     */
    @Scheduled(cron = "0 */30 * * * *")
    @Transactional(readOnly = false)
    fun processScheduledOccurrencesWithoutSteps() {
        try {
            val brazilZone = ZoneId.of("America/Sao_Paulo")
            val currentTime = LocalDateTime.now(brazilZone)
            val endTime = currentTime.withSecond(59).withNano(999999999)
            val startTime = endTime.minus(30, ChronoUnit.MINUTES)
            
            logger.info("Iniciando processamento de ocorrências criadas entre $startTime e $endTime sem steps")
            
            // Buscar ocorrências criadas nos últimos 30 minutos que não possuem steps
            val scheduledOccurrences = occurrenceRepository.findScheduledOccurrencesWithoutSteps(startTime, endTime)
            
            if (scheduledOccurrences.isEmpty()) {
                return
            }
            
            var processedCount = 0
            var errorCount = 0
            
            for (occurrence in scheduledOccurrences) {
                try {
                    createInitialStep(occurrence)
                    processedCount++
                    
                } catch (e: Exception) {
                    errorCount++
                }
            }
            
            logger.info("Processamento concluído - Processadas: $processedCount, Erros: $errorCount")
            
        } catch (e: Exception) {
            logger.error("Erro geral no processamento de ocorrências agendadas", e)
        }
    }
    
    /**
     * Cria o step inicial TICKE para uma ocorrência
     */
    private fun createInitialStep(occurrence: OccurrenceEntity) {
        val newStep = OccurrenceStepEntity(
            stepId = StepTypeOccurrence.TICKE,
            dtStart = LocalDateTime.now(),
            latest = 1,
            updatedAt = LocalDateTime.now(),
            occurrence = occurrence
        )
        
        occurrenceStepRepository.save(newStep)
        
        occurrence.currentStep = StepTypeOccurrence.TICKE
        occurrenceRepository.save(occurrence)
    }
}
