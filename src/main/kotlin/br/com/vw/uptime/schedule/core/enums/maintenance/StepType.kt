package br.com.vw.uptime.schedule.core.enums.maintenance

enum class StepType(val description:String) {
    TICKET("Chamado iniciado"),
    SCREENING("Triagem"),
    REPAIR("Reparo"),
    INSPECTION("Inspeção"),
    RELEASE("Liberado"),
    FINISHED("Finalizado");
}