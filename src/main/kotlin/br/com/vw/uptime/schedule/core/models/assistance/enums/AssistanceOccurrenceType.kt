package br.com.vw.uptime.schedule.core.models.assistance.enums

import com.fasterxml.jackson.annotation.JsonCreator

enum class AssistanceOccurrenceType(
    val type:String,
    val description:String
) {
    PREVENTIVE("P", "Preventivo"),
    CORRECTIVE("C", "Corretivo"),
    PREVENTIVE_AND_CORRECTIVE("PC", "Preventivo e Corretivo"),
    ASSISTANCE("A", "Socorro"),
    WINCH("W", "Guincho"),
    IN_DEALERSHIP("D", "Na concessionária");

    companion object {
        @JvmStatic
        @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
        fun fromType(type: String): AssistanceOccurrenceType {
            return entries.firstOrNull { it.type == type }
                ?: throw IllegalArgumentException("Unknown AssistanceOccurrenceType: $type")
        }
    }
}