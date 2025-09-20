package br.com.vw.uptime.schedule.core.enums.checkups

enum class MetricTypeEnum(
    val value:String,
    val label:String
) {
    ODOMETER("1", "odometer"),
    HOUR_METER("2", "hourMeter");

    companion object {
        fun getMetricTypeByGroupId(maintenanceGroupId:String): MetricTypeEnum {
            return when(maintenanceGroupId) {
                MaintenanceGroupEnum.ESPECIAL.value() ->  HOUR_METER
                else -> ODOMETER
            }
        }
    }
}