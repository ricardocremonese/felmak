package br.com.vw.uptime.schedule.core.models.maintenance

import br.com.vw.uptime.schedule.core.utils.DefaultCurrency
import java.math.BigDecimal

class VehicleServices {

    lateinit var services:List<VehicleService>

    fun getTotal() : String {
        val sum = services
            .map { it.price }
            .fold(BigDecimal.ZERO) {acc, price ->
                acc + price
            }
        return DefaultCurrency.format(sum)
    }

    fun getTotal(vehicles: List<VehicleService>) : String {
        val sum = vehicles
            .map { it.price }
            .fold(BigDecimal.ZERO) {acc, price ->
                acc + price
            }
        return DefaultCurrency.format(sum)
    }
}