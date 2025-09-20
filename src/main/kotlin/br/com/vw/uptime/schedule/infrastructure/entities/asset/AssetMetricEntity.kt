package br.com.vw.uptime.schedule.infrastructure.entities.asset

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "asset_metric")
data class AssetMetricEntity(

    @Id
    @Column(name = "asset_id", nullable = false)
    var assetId: String? = null,

    @Column(name = "odometer", nullable = true)
    var odometer:Double?  = null,

    @Column(name = "hour_meter", nullable = true)
    var hourMeter:Double?  = null,

    @Column(name = "odometer_at", nullable = true)
    var odometerAt:LocalDateTime?  = null,

    @Column(name = "hour_meter_at", nullable = true)
    var hourMeterAt:LocalDateTime?  = null,

    @Column(name = "account_id", nullable = false)
    var accountId:String?  = null,
)