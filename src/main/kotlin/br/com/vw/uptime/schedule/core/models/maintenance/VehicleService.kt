package br.com.vw.uptime.schedule.core.models.maintenance

import br.com.vw.uptime.schedule.core.utils.DefaultCurrency
import java.math.BigDecimal

class VehicleService {

    lateinit var id:String
    lateinit var name:String
    lateinit var price:BigDecimal

    fun getPrice():String {
        return DefaultCurrency.format(price)
    }

}