package br.com.vw.uptime.schedule.infrastructure.repositories.failure

import br.com.vw.uptime.schedule.infrastructure.entities.failure.FailureEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FailureRepository : JpaRepository<FailureEntity, Int> {
    fun findByTitleContainingIgnoreCase(title: String, pageable: org.springframework.data.domain.Pageable): org.springframework.data.domain.Page<FailureEntity>
}
