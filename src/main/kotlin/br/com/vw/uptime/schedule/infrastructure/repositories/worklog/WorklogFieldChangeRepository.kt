package br.com.vw.uptime.schedule.infrastructure.repositories.worklog

import br.com.vw.uptime.schedule.infrastructure.entities.worklog.WorklogFieldChangeEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface WorklogFieldChangeRepository : JpaRepository<WorklogFieldChangeEntity, Long> {

    /**
     * Busca alterações de campos de um worklog específico
     */
    fun findByWorklogKanbanIdOrderByChangedAtDesc(worklogKanbanId: Long): List<WorklogFieldChangeEntity>

    /**
     * Busca alterações de um campo específico
     */
    fun findByFieldNameOrderByChangedAtDesc(fieldName: String): List<WorklogFieldChangeEntity>

    /**
     * Busca alterações de campos de uma ocorrência específica
     */
    @Query("""
        SELECT f FROM WorklogFieldChangeEntity f 
        JOIN f.worklogKanban w 
        WHERE w.occurrenceId = :occurrenceId 
        ORDER BY f.changedAt DESC
    """)
    fun findByOccurrenceId(@Param("occurrenceId") occurrenceId: Int): List<WorklogFieldChangeEntity>

    /**
     * Busca alterações de campos de uma ocorrência por UUID
     */
    @Query("""
        SELECT f FROM WorklogFieldChangeEntity f 
        JOIN f.worklogKanban w 
        WHERE w.occurrenceUuid = :occurrenceUuid 
        ORDER BY f.changedAt DESC
    """)
    fun findByOccurrenceUuid(@Param("occurrenceUuid") occurrenceUuid: String): List<WorklogFieldChangeEntity>
}
