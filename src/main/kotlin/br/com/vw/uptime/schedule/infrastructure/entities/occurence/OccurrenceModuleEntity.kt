package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import jakarta.persistence.*

@Entity
@Table(name = "OCCURRENCE_MODULES")
data class OccurrenceModuleEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    var id: Int? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_OCCURRENCE", nullable = false)
    var occurrence: OccurrenceEntity? = null,

    @Column(name = "NAME", nullable = true)
    var name: String? = null,

    @Column(name = "SPN", nullable = true)
    var spn: String? = null,

    @Column(name = "FMI", nullable = true)
    var fmi: Int? = null
)