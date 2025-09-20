package br.com.vw.uptime.schedule.core.enums.occurrence

enum class FinalizationReasonType(
    val code: String,
    val description: String
) {
    TOW_TRUCK_UNAVAILABLE("TOW_TRUCK_UNAVAILABLE", "Indisponibilidade do reboque"),
    TOW_TRUCK_DEALERSHIP("TOW_TRUCK_DEALERSHIP", "Reboque acionado pela concessionária"),
    CUSTOMER_OWN_MEANS("CUSTOMER_OWN_MEANS", "Meio próprio do cliente");

    companion object {
        fun fromCode(code: String): FinalizationReasonType? {
            return entries.firstOrNull { it.code == code }
        }
    }
}
