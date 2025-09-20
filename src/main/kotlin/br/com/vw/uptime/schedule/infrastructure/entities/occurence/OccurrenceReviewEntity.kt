package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import br.com.vw.uptime.schedule.infrastructure.services.occurence.StepTypeOccurrence
import jakarta.persistence.*

@Entity
@Table(name = "OCCURRENCE_REVIEW")
data class OccurrenceReviewEntity(

    @EmbeddedId
    var id: OccurrenceReviewId? = OccurrenceReviewId(),

    @MapsId("occurrenceId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_occurrence", nullable = false)
    var occurrence: OccurrenceEntity? = null,

    @Column(name = "comment")
    var comment: String? = null,

    @Column(name = "rate", nullable = false)
    var rate: Int? = null,
)

@Embeddable
data class OccurrenceReviewId(
    @Column(name = "id_occurrence")
    var occurrenceId: Int? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "step", nullable = false)
    var step: StepTypeOccurrence? = null,
)