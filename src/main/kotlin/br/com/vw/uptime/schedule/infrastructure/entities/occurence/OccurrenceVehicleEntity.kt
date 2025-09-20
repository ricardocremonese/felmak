package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import jakarta.persistence.*

@Entity
@Table(name = "OCCURRENCE_VEHICLE")
data class OccurrenceVehicleEntity(

    @Id
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_OCCURRENCE", referencedColumnName = "ID")
    var occurrence: OccurrenceEntity? = null,

    @Column(name = "CHASSIS")
    var chassis: String? = null,

    /**
     * Customer asset id
     */
    @Column(name = "ASSET_ID")
    var assetId: String? = null,

    @Column(name = "ASSET_TOWER_ID")
    var assetTowerId: String? = null,

    @Column(name = "MODEL")
    var model: String? = null,

    @Column(name = "LICENSE_PLATE")
    var licensePlate: String? = null,

    @Column(name = "VEHICLE_TYPE")
    var vehicleType: String? = null,

    @Column(name = "NAME")
    var name: String? = null,

    @Column(name    = "VEHICLE_YEAR")
    var vehicleYear: Int? = null,

    @Column(name = "ODOMETER")
    var odometer: Int? = null,

    @Column(name = "HOUR_METER")
    var hourMeter: Int? = null,

    @Column(name = "PAYLOAD_TYPE")
    var payloadType: String? = null,

    @Column(name = "MAXIMUM_PAYLOAD")
    var maximumPayload: Int? = null,

    @Column(name = "CRITICAL_PAYLOAD")
    var criticalPayload: String? = null,

    @Column(name = "STOPPED")
    var stopped: String? = null,

    @Column(name = "EMISSION_STANDARD")
    var emissionStandard: String? = null
)