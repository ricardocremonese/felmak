package br.com.vw.uptime.schedule.infrastructure.entities.checkup

import jakarta.persistence.*

@Entity
@Table(name = "CHECKUP_TYPE")
data class CheckupTypeEntity(

    @Id
    @Column(name = "CODE", nullable = false)
    var code:String? = null,

    @Column(name = "NAME", nullable = false)
    var name:String? = null

)