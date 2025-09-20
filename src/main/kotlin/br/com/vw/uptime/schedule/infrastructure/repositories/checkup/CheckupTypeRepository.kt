package br.com.vw.uptime.schedule.infrastructure.repositories.checkup

import br.com.vw.uptime.schedule.infrastructure.entities.checkup.CheckupTypeEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository


@Repository
interface CheckupTypeRepository : JpaRepository<CheckupTypeEntity, String> {

}