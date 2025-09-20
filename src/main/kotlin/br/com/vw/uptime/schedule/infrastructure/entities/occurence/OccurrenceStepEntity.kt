package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import br.com.vw.uptime.schedule.infrastructure.services.occurence.StepTypeOccurrence
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "OCCURRENCE_STEP")
data class OccurrenceStepEntity(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    var id: Int? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_OCCURRENCE", nullable = false)
    var occurrence: OccurrenceEntity? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "ID_STEP", nullable = false)
    var stepId: StepTypeOccurrence = StepTypeOccurrence.TICKE,

    @Column(name = "REPORT", columnDefinition = "TEXT")
    var report: String? = null,

    @Column(name = "OBSERVATION", columnDefinition = "TEXT")
    var observation: String? = null,

    @Column(name = "DT_START")
    var dtStart: LocalDateTime = LocalDateTime.now(),

    @Column(name = "EXPECTED_DT_END")
    var expectedDtEnd: LocalDateTime? = null,

    @Column(name = "DT_END")
    var dtEnd: LocalDateTime? = null,

    @Column(name = "LATEST", nullable = false)
    var latest: Int = 0,

    @Column(name = "ESTIMATED_TIME")
    var estimatedTime: Int? = null,

    @Column(name = "UPDATED_AT")
    var updatedAt: LocalDateTime? = null,

    @Column(name = "UPDATED_BY")
    var updatedBy: String? = null,

    @Column(name = "UPDATED_BY_UUID")
    var updatedByUuid: String? = null
)
