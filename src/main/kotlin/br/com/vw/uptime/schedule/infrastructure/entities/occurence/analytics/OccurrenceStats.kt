package br.com.vw.uptime.schedule.infrastructure.entities.occurence.analytics

import java.time.LocalDateTime

interface OccurrenceStats {
    fun getTotalOccurrences(): Long
    fun getTotalMinutes(): Long
}

interface OccurrenceWithMinutes {
    fun getOccurrenceUuid(): String
    fun getTotalMinutes(): Long
    fun getCustomer(): String?
    fun getModel(): String?
    fun getLegislation(): String?
    fun getCity(): String?
    fun getState(): String?
    fun getChassis(): String?
    fun getFantasyName(): String?
    fun getDn(): String?
    fun getStep(): String?
    fun getStepStart(): LocalDateTime?
    fun getStepEnd(): LocalDateTime?
}
