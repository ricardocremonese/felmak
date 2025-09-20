package br.com.vw.uptime.schedule.core.utils

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

class DateFormattingDefault
{
    companion object {
        private val formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy H:mm:ss")
        fun formatDateTime(localDateTime: LocalDateTime):String {
            return formatter.format(localDateTime)
        }
    }
}