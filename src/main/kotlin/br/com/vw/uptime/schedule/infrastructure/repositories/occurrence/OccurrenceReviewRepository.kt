package br.com.vw.uptime.schedule.infrastructure.repositories.occurrence

import br.com.vw.uptime.schedule.infrastructure.entities.occurence.OccurrenceReviewEntity
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.OccurrenceReviewId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface OccurrenceReviewRepository : JpaRepository<OccurrenceReviewEntity, OccurrenceReviewId> {
    fun findByOccurrenceUuid(occurrenceUuid: String) : List<OccurrenceReviewEntity>
}
