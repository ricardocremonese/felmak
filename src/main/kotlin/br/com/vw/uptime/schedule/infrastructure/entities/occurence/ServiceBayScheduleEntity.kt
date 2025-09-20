package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import jakarta.persistence.*
import java.time.LocalDateTime


@Entity
@Table(name = "SERVICE_BAY_SCHEDULE")
class ServiceBayScheduleEntity (

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ID", nullable = false)
    var id: String = "",

    @Column(name = "START_DATE", nullable = false)
    var startDate:LocalDateTime? = null,

    @Column(name = "END_DATE", nullable = false)
    var endDate:LocalDateTime? = null,

    @Column(name = "DN", nullable = false)
    var dn:String? = null,

    @Column(name = "CREATED_AT", nullable = false)
    val createdAt:LocalDateTime? = LocalDateTime.now(),

    @Column(name = "UPDATED_AT", nullable = true)
    var updatedAt: LocalDateTime? = null,

    @Column(name = "ACTIVE", nullable = false)
    var active:Boolean = true,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_OCCURRENCE", nullable = false)
    var occurrence: OccurrenceEntity? = null,

    @Column(name = "ID_OCCURRENCE", insertable = false, updatable = false)
    var occurrenceId:Int = 0,

    @Column(name = "created_by", nullable = false)
    var createdBy: String? = null,

    @Column(name = "created_by_id", nullable = false)
    var createdById: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SERVICE_BAY_ID", nullable = false)
    var serviceBay: ServiceBayEntity? = null,
) {
    fun inactive() {
        active = false
        updatedAtToNow()
    }
    private fun updatedAtToNow() {
        updatedAt = LocalDateTime.now()
    }
}