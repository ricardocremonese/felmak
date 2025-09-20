package br.com.vw.uptime.schedule.core.utils

import java.text.Normalizer
import java.util.*

class StringUtils {

    companion object {
        fun normalize(str:String) : String {
            return Normalizer.normalize(str, Normalizer.Form.NFD)
                .replace("\\p{Mn}+".toRegex(), "") // Removes accents
                .lowercase(Locale.getDefault())
        }

        fun removeAccents(str: String): String {
            return Normalizer.normalize(str, Normalizer.Form.NFD)
                .replace("\\p{Mn}+".toRegex(), "")
        }
    }
}