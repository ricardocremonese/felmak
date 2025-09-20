package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import br.com.vw.uptime.schedule.infrastructure.entities.dealership.DealershipEntity
import jakarta.persistence.*
import java.io.Serializable

@Entity
@Table(name = "OCCURRENCE_DEALERSHIP")
data class OccurrenceDealershipEntity(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    var id:Int? = null,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dn", insertable = false, updatable = false)
    var dealership: DealershipEntity? = null,

    @Column(name = "dn", nullable = true)
    var dn: String? = null,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_OCCURRENCE", referencedColumnName = "ID", nullable = false)
    var occurrence: OccurrenceEntity? = null,

    @Column(name = "REGIONAL")
    var regional: String? = null,

    @Column(name = "CELL_NUMBER")
    var cellNumber: String? = null,

    @Column(name = "AREA")
    var area: String? = null,

    @Column(name = "LOCAL")
    var local: String? = null,

    @Column(name = "REPRESENTATIVE")
    var representative: String? = null,
)