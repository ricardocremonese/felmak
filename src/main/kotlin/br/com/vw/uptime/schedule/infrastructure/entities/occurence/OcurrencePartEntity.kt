package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import jakarta.persistence.*

@Entity
@Table(name = "OCCURRENCE_PARTS")
data class OccurrencePartEntity(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    var id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PART_ORDER_ID", nullable = false)
    var partOrder: OccurrencePartOrderEntity? = null,

    @Column(name = "PART_NUMBER")
    var partNumber:String? = null,

    @Column(name = "QUANTITY")
    var quantity:Int = 0

)