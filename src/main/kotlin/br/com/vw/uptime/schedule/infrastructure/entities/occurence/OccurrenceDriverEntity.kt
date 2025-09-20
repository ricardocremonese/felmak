package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import jakarta.persistence.*

@Entity
@Table(name = "OCCURRENCE_DRIVER")
data class OccurrenceDriverEntity(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    val id: Int? = null,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_OCCURRENCE", referencedColumnName = "ID")
    var occurrence: OccurrenceEntity? = null,

    @Column(name = "NAME")
    var name: String? = null,

    @Column(name = "DRIVER_LICENSE_NUMBER")
    var driverLicenseNumber: String? = null,

    @Column(name = "PHONE")
    var phone: String? = null,

    @Column(name = "CHECK_IN_DRIVER")
    var checkInDriver: String? = null
)