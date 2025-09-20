package br.com.vw.uptime.schedule.infrastructure.repositories.occurrence

import br.com.vw.uptime.schedule.infrastructure.entities.occurence.StepEntity
import org.springframework.data.jpa.repository.JpaRepository

interface StepRepository : JpaRepository<StepEntity, String> {

}