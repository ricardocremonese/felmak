package br.com.vw.uptime.schedule.infrastructure.repositories.worklog

import br.com.vw.uptime.schedule.infrastructure.entities.worklog.WorklogKanbanEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface WorklogKanbanRepository : JpaRepository<WorklogKanbanEntity, Long> {

    /**
     * Busca logs de uma ocorrência específica ordenados por data de alteração
     */
    fun findByOccurrenceIdOrderByChangedAtDesc(occurrenceId: Int): List<WorklogKanbanEntity>

    /**
     * Busca logs de uma ocorrência por UUID ordenados por data de alteração
     */
    fun findByOccurrenceUuidOrderByChangedAtDesc(occurrenceUuid: String): List<WorklogKanbanEntity>

    /**
     * Busca logs de um usuário específico
     */
    fun findByUserIdOrderByChangedAtDesc(userId: String, pageable: Pageable): Page<WorklogKanbanEntity>

    /**
     * Busca logs em um período específico
     */
    @Query("""
        SELECT w FROM WorklogKanbanEntity w 
        WHERE w.changedAt BETWEEN :startDate AND :endDate 
        ORDER BY w.changedAt DESC
    """)
    fun findByDateRange(
        @Param("startDate") startDate: LocalDateTime,
        @Param("endDate") endDate: LocalDateTime,
        pageable: Pageable
    ): Page<WorklogKanbanEntity>

    /**
     * Busca logs de uma etapa específica
     */
    fun findByStepOrderByChangedAtDesc(step: br.com.vw.uptime.schedule.infrastructure.services.occurence.StepTypeOccurrence, pageable: Pageable): Page<WorklogKanbanEntity>

    /**
     * Busca logs de uma ocorrência em uma etapa específica
     */
    fun findByOccurrenceIdAndStepOrderByChangedAtDesc(
        occurrenceId: Int,
        step: br.com.vw.uptime.schedule.infrastructure.services.occurence.StepTypeOccurrence
    ): List<WorklogKanbanEntity>
}
