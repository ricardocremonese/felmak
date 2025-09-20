package br.com.vw.uptime.schedule.core.models.dealership

open class Dealership {

    lateinit var id: String
    var favorite: Boolean = false
    lateinit var fantasyName: String
    lateinit var state: String
    lateinit var city: String
    var website: String = ""
    var whatsapp: String? = ""
    var dn: String = ""
    var cep: String = ""
    var telephone: String = ""
    var address: String = ""
    var instagram: String = ""
    var neighborhood: String = ""
    var latitude:Double = 0.0
    var longitude:Double = 0.0
    var distance:Double = 0.0
    var regional: String? = null
    var areaCode: String? = null
    var cnpj: String? = null
    var representative: String? = null
    var cell: String? = null
}