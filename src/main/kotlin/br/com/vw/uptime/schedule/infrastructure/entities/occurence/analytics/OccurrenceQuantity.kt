package br.com.vw.uptime.schedule.infrastructure.entities.occurence.analytics

import java.time.LocalDate

interface OccurrenceQuantity {
    fun getStep() : String
    fun getDate() : LocalDate
    fun getAmount(): Int
    fun getChassisList(): List<String>
    fun getOccurrenceUuidList(): List<String>
}