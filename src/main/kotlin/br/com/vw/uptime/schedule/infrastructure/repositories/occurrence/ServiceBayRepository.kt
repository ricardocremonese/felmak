package br.com.vw.uptime.schedule.infrastructure.repositories.occurrence

import br.com.vw.uptime.schedule.infrastructure.entities.occurence.ServiceBayEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface ServiceBayRepository : JpaRepository<ServiceBayEntity, String> {
    fun findOneByIdAndDnAndActiveTrue(id:String, dn:String) : Optional<ServiceBayEntity>
    fun findByDnAndActiveTrue(dn:String) : List<ServiceBayEntity>
    fun existsByNameIgnoreCaseAndActiveTrue(name: String): Boolean
    fun existsByNameIgnoreCaseAndIdNot(name: String, serviceBayId: String): Boolean
}