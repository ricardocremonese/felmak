package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "SERVICE_BAY")
data class ServiceBayEntity (

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ID", nullable = false)
    val id: String = "",

    @Column(name = "NAME", nullable = false)
    var name:String = "",

    @Column(name = "DN", nullable = false)
    var dn:String = "",

    @Column(name = "CREATED_AT", nullable = false)
    val createdAt: LocalDateTime? = LocalDateTime.now(),

    @Column(name = "UPDATED_AT", nullable = true)
    var updatedAt: LocalDateTime? = null,

    @Column(name = "ACTIVE", nullable = false)
    var active:Boolean = true
) {
    fun inactive() {
        active = false
        updatedAtToNow()
    }
    fun updatedAtToNow() {
        updatedAt = LocalDateTime.now()
    }
}