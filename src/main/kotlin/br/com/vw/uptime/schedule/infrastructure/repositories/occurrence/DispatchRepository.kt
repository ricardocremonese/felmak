package br.com.vw.uptime.schedule.infrastructure.repositories.occurrence

import br.com.vw.uptime.schedule.core.enums.occurrence.DispatchStatus
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.DispatchEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DispatchRepository : JpaRepository<DispatchEntity, Int> {
    fun findByOccurrenceUuidAndDispatchUuidAndStatusIs(occurrenceUuid: String, dispatchUuid: String, status: DispatchStatus) : DispatchEntity?
}
