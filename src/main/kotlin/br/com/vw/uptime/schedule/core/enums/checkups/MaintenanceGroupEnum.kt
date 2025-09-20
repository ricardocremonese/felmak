package br.com.vw.uptime.schedule.core.enums.checkups

import br.com.vw.uptime.schedule.core.utils.StringUtils

enum class MaintenanceGroupEnum(
    private val value:String,
    private val label:String
) {
    RODOVIARIO("1","Rodoviário"),
    MISTO("2","Misto"),
    SEVERO("3","Severo"),
    ESPECIAL("4","Especial");

    fun value():String {
        return value
    }

    fun label():String {
        return label
    }

    companion object {
        fun byMaintenanceGroupName(maintenanceGroup: String): MaintenanceGroupEnum? {
            return MaintenanceGroupEnum.entries.firstOrNull {
                StringUtils.normalize(it.label) == StringUtils.normalize(maintenanceGroup)
            }
        }

        fun byId(maintenanceGroupId: String): MaintenanceGroupEnum {
            return MaintenanceGroupEnum.entries.first {
                it.value() == maintenanceGroupId
            }
        }
    }
}