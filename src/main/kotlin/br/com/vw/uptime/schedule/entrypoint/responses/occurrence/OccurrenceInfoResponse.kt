package br.com.vw.uptime.schedule.entrypoint.responses.occurrence

data class OccurrenceInfoResponse(
    val uuid: String,
    val model: String?,
    val name: String?,
    val chassis: String?,
    val assetId: String?,
    val odometer: Int?,
    val hourMeter: Int?,
    val licensePlate: String?,
    val estimateTime: String? = null,
    val totalTime: String? = null,
    val criticality: Int? = null,
    val partnerId:String? = null,
    val scheduleUuid: String? = null,
    val steps: List<OccurrenceStepResponse>,
    val serviceBaySchedule: ServiceBayScheduleResponse? = null,
    val createdByUserProfileId: String? = null,
    val finished: Boolean? = null,
    val dealership: String? = null,
    val occurrenceType: String? = null
)