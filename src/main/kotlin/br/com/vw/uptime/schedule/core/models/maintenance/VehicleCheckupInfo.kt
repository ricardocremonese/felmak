package br.com.vw.uptime.schedule.core.models.maintenance

data class VehicleCheckupInfo(
    val lastVehicleCheckup: StampLast? = null,
    val nextVehicleCheckup: NextCheckups? = null,
    val previousCheckups: List<StampLast> = emptyList(),
    val nextCheckups: List<NextCheckups> = emptyList(),
    val metricType: String? = null,
    val chassis: String? = null
) 