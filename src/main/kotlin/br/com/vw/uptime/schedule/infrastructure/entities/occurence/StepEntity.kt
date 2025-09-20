package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "STEP")
data class StepEntity(

    @Id
    @Column(name = "ID", nullable = false)
    var id: String = "",

    @Column(name = "NAME", nullable = false)
    val name: String = "",

    @Column(name = "HOURS_ELAPSED", nullable = false)
    var hoursElapsed: Int? = null,
)