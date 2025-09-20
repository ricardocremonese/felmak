package br.com.vw.uptime.schedule.infrastructure.entities.dealership

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "DEALERSHIP")
class DealershipEntity {

    @Id
    @Column(name = "DN", nullable = false)
    lateinit var dn: String

    @Column(name = "FANTASY_NAME", nullable = false)
    lateinit var fantasyName: String

    @Column(name = "ADDRESS", nullable = false)
    lateinit var address: String

    @Column(name = "CITY", nullable = false)
    lateinit var city: String

    @Column(name = "STATE", nullable = true)
    var state: String? = null

    @Column(name = "TELEPHONE", nullable = false)
    lateinit var telephone: String

    @Column(name = "REGIONAL")
    var regional: String? = null

    @Column(name = "NEIGHBORHOOD")
    var neighborhood: String? = null

    @Column(name = "CEP")
    var cep: String? = null

    @Column(name = "LATITUDE")
    var latitude: Double? = null

    @Column(name = "LONGITUDE")
    var longitude: Double? = null

    @Column(name = "AREA_CODE")
    var areaCode: String? = null

    @Column(name = "SOCIAL_REASON")
    var socialReason: String? = null

    @Column(name = "WHATSAPP")
    var whatsapp: String? = null

    @Column(name = "WEBSITE")
    var website: String? = null

    @Column(name = "REPRESENTATIVE")
    var representative: String? = null

    @Column(name = "CELL")
    var cell: String? = null

    @Column(name = "CNPJ")
    var cnpj: String? = null
}