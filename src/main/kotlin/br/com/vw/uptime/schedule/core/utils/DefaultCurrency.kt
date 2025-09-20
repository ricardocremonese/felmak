package br.com.vw.uptime.schedule.core.utils

import java.math.BigDecimal
import java.text.NumberFormat
import java.util.*

class DefaultCurrency {

    companion object {
        fun format(value:BigDecimal):String {
            val brlFormat = NumberFormat.getCurrencyInstance(Locale("pt", "BR"))
            return brlFormat.format(value)
        }
    }
}