package br.com.vw.uptime.schedule.core.enums.checkups

enum class WarrantyStatusEnum(
    private val statusId:String,
    private val statusName:String
) {
    UNDER_WARRANTY("1", "Em Garantia"),
    EXPIRED("2","Expirado");

    fun statusId():String {
        return statusId
    }

    fun statusName():String {
        return statusName
    }
}