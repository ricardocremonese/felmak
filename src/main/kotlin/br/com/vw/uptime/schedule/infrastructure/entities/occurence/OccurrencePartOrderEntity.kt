package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "OCCURRENCE_PART_ORDER")
data class OccurrencePartOrderEntity(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    var id: Int = 0,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_OCCURRENCE", nullable = false)
    var occurrence: OccurrenceEntity? = null,

    @Column(name = "DT_ORDER")
    var dtOrder: LocalDateTime? = null,

    @Column(name = "DT_ESTIMATE")
    var dtEstimate: LocalDateTime? = null,

    @Column(name = "DT_DELIVERY_ESTIMATE")
    var dtDeliveryEstimate: LocalDateTime? = null,

    @Column(name = "STATUS")
    var status: String? = null,

    @Column(name = "ORDER_NUMBER")
    var orderNumber: String? = null,

    @Column(name = "STATUS_ORDER")
    var statusOrder: String? = null,

    @OneToMany(mappedBy = "partOrder", cascade = [CascadeType.ALL], fetch = FetchType.LAZY, orphanRemoval = true)
    var occurrenceParts:MutableList<OccurrencePartEntity> = mutableListOf(),
)