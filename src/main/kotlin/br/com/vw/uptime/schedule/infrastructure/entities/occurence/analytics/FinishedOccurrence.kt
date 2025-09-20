package br.com.vw.uptime.schedule.infrastructure.entities.occurence.analytics

import br.com.vw.uptime.schedule.infrastructure.services.occurence.StepTypeOccurrence
import java.time.LocalDate
import java.time.LocalDateTime

interface FinishedOccurrence {
    fun getEstimatedTime(): Long?
    fun getTotalTime(): Long
    fun getUuid(): String
    fun getAccountUuid(): String
    fun getCreatedAt(): LocalDate
    fun getUpdatedAt(): LocalDate
    fun getCriticality(): Int
    fun getIdStep(): StepTypeOccurrence
    fun getStepDtStart(): LocalDateTime
    fun getStepDtEnd(): LocalDateTime
    fun getModel(): String?
    fun getName(): String?
    fun getChassis(): String
    fun getAssetId(): String?
    fun getOdometer(): Int?
    fun getHourMeter(): Int?
    fun getLicensePlate(): String
}