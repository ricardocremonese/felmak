package br.com.vw.uptime.schedule.core.models.assistance.enums

enum class AssistanceHistoryState(val description:String) {
    CREATED_ASSISTANCE("Socorro mecânico criado"),
    UPDATE_ASSISTANCE("Socorro mecânico atualizado"),
    ASSIGNED_DISPATCH("Acionamento associado"),
    CANCELED_DISPATCH("Acionamento cancelado")
}