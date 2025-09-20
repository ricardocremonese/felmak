package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import br.com.vw.uptime.schedule.core.enums.occurrence.DispatchRefusalType
import br.com.vw.uptime.schedule.core.enums.occurrence.DispatchStatus
import br.com.vw.uptime.schedule.core.enums.occurrence.OccurrenceDispatchType
import jakarta.persistence.*

@Entity
@Table(name = "DISPATCH", indexes = [Index(name = "DISPATCH_UUID_IDX", columnList = "DISPATCH_UUID", unique = true)] )
data class DispatchEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    var id:Int? = null,

    @Column(name = "DISPATCH_UUID", nullable = false)
    var dispatchUuid: String = "",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_OCCURRENCE", nullable = false)
    val occurrence: OccurrenceEntity? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false)
    var status: DispatchStatus? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "OCCURRENCE_TYPE", nullable = false)
    val occurrenceType: OccurrenceDispatchType? = null,

    @Column(name = "PAYER", nullable = false)
    val payer: String? = null,

    @Column(name = "AUTHORIZE_PAYMENT")
    val authorizePayment: Boolean? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "REASON_REFUSAL")
    var reasonRefusal: DispatchRefusalType? = null,

    @Column(name = "DESCRIPTION_REFUSAL", columnDefinition = "TEXT")
    var descriptionRefusal: String? = null,

    @Column(name = "ROUTE")
    val route: String? = null,

    @Column(name = "DN")
    val dn: String? = null,

    @Column(name = "DRIVER")
    var driver: String? = null,
)