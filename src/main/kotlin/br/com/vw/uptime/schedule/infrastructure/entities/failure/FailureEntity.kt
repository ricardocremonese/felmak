package br.com.vw.uptime.schedule.infrastructure.entities.failure

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "FAILURE")
data class FailureEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    var id: Int? = null,

    @Column(name = "TITLE", nullable = false)
    var title: String = "",

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    var description: String? = null,

    @Column(name = "VIDEO_FILENAME")
    var videoFilename: String? = null,

    @Column(name = "CREATED_BY", nullable = false)
    var createdBy: String = "",

    @Column(name = "CREATED_AT", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "UPDATED_AT")
    var updatedAt: LocalDateTime? = null
)
