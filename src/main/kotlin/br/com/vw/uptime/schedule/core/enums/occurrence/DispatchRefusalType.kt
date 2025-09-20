package br.com.vw.uptime.schedule.core.enums.occurrence

enum class DispatchRefusalType(val description: String) {
    NA("Nenhuma das opções"),
    NO_RESOURCE("Não possui recursos"),
    NO_PARTS("Não possui peças"),
    NO_STAFF("Não possui técnico")
}