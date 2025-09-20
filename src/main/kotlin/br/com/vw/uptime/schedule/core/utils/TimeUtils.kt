package br.com.vw.uptime.schedule.core.utils

class TimeUtils {

    companion object {

        const val DURATION_PATTERN:String = "^\\d{1,}:\\d{2}\$"

        fun durationToTotalMinutes(duration: String): Int {
            val (hours, minutes) = duration.split(":").map { it.toInt() }
            return (hours * 60) + minutes
        }

        fun minutesToDurationString(totalMinutes: Int): String {
            val hours = totalMinutes / 60
            val minutes = totalMinutes % 60
            return "$hours:${minutes.toString().padStart(2, '0')}"
        }
    }

}