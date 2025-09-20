package br.com.vw.uptime.schedule.core.models.maintenance

import jakarta.validation.constraints.NotEmpty

class DealerShipSchedule {

    lateinit var id: String
    lateinit var fantasyName: String
    lateinit var state: String
    lateinit var city: String
    var website: String = ""
    var whatsapp: String = ""
    var cep: String = ""
    var telephone: String = ""
    var address: String = ""
    var instagram: String = ""
    var neighborhood: String = ""
    var latitude:Double = 0.0
    var longitude:Double = 0.0
}