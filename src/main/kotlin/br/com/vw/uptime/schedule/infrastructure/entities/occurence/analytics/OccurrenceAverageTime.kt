package br.com.vw.uptime.schedule.infrastructure.entities.occurence.analytics

interface OccurrenceAverageTime {
    fun getStep() : String
    fun getVehicle() : String
    fun getAverageTime(): Long?
}