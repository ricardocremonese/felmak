// src/main/kotlin/br/com/vw/uptime/schedule/infrastructure/repositories/occurrence/OccurrenceStepRepository.kt

package br.com.vw.uptime.schedule.infrastructure.repositories.occurrence

import br.com.vw.uptime.schedule.infrastructure.entities.occurence.OccurrenceStepEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

/**
 * Repositório responsável por operações sobre a tabela occurrence_step
 * e pelas consultas às materialized views que calculam o tempo médio por etapa.
 */
@Repository
interface OccurrenceStepRepository : JpaRepository<OccurrenceStepEntity, Int> {

    /**
     * Retorna uma lista de pares [etapa, tempo médio em segundos],
     * a partir da materialized view mv_average_time_per_step.
     *
     * Cada elemento da lista é um Array<Any> onde:
     *   index 0 → nome da etapa (String)
     *   index 1 → tempo médio em segundos (Number)
     */
    @Query(
        value = """
            SELECT
                step,
                average_seconds
            FROM uptime_dev.mv_average_time_per_step
        """,
        nativeQuery = true
    )
    fun findAverageTimePerStepRaw(): List<Array<Any>>

    /**
     * Retorna uma única linha pivotada com colunas nomeadas para cada etapa,
     * a partir da materialized view mv_average_time_per_step_pivot.
     *
     * O resultado é um Array<Any> onde cada posição corresponde
     * a uma coluna da view na ordem definida:
     *   index 0  → rowid (Integer)
     *   index 1  → Chamado (Long)
     *   index 2  → Triagem (Long)
     *   index 3  → Deslocamento (Long)
     *   index 4  → 2ª Diagnose (Long)
     *   index 5  → Remoção (Long)
     *   index 6  → 3ª Diagnose (Long)
     *   index 7  → 4ª Diagnose (Long)
     *   index 8  → Análise Garantia (Long)
     *   index 9  → Ok do Cliente (Long)
     *   index 10 → Peças (Long)
     *   index 11 → Peças em trânsito (Long)
     */
    @Query(
        value = """
            SELECT *
            FROM uptime_dev.mv_average_time_per_step_pivot
        """,
        nativeQuery = true
    )
    fun findAverageTimePerStepPivot(): Array<Any>
}
