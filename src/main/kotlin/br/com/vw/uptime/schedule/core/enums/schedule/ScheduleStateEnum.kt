package br.com.vw.uptime.schedule.core.enums.schedule

enum class ScheduleStateEnum(
    private val state:String,
    private val description:String
) {

    REQUESTED("requested", "Solicitado"),
    RESCHEDULED("rescheduled", "Reagendado"),
    ACCEPTED("accepted", "Aceito"),
    REJECTED("rejected", "Rejeitado");

    fun state():String {
        return this.state
    }

    fun description():String {
        return description
    }

    companion object {
        fun getDescriptionByState(state:String) : String {
            val scheduleEnum = entries.toTypedArray().firstOrNull {
                it.state == state
            } ?: throw Exception("Schedule status $state not found.")
            return scheduleEnum.description
        }
    }

}