package br.com.vw.uptime.schedule.core.enums.checkups

enum class CheckupTypeScheduleEnum(val description: String) {
    FIELD_CAMPAIGN("Campanha de campo"),
    PREVENTIVE("Preventivo"),
    CORRECTIVE("Corretivo"),
    PREVENTIVE_AND_CORRECTIVE("Preventivo e Corretivo")
}