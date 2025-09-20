package br.com.vw.uptime.schedule.core.enums.assistance

enum class AssistanceDispatchStepType(val description: String) {
        ASSIGN_AUTO_MECHANIC("Mecânico atribuído"),
        NOTIFY_CUSTOMER("Notificar cliente"),
        IN_TRANSIT("Em deslocamento"),
        ARRIVED_AT("Chegada no local"),
        CHECKPOINT_DONE("Checkpoint realizado"),
        CONFIRM_REPAIR("Confirmar reparo")
}