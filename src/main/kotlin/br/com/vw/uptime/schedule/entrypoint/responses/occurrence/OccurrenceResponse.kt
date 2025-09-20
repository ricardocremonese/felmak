package br.com.vw.uptime.schedule.entrypoint.responses.occurrence

import br.com.vw.uptime.schedule.infrastructure.entities.occurence.Failure
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.PartOrder
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.PartOrderDeliveryDates
import java.time.LocalDateTime

data class OccurrenceResponse(
    val uuid: String,
    val accountUuid: String?,
    val currentStep: String?,
    val criticality: Int?,
    val osNumber: String?,
    val osDtOpenAt: LocalDateTime?,
    val renter: String?,
    val createdBy: String?,
    val createdByUuid: String?,
    val createdByUserProfileId: String?,
    val literatureTroubleshooting: String?,
    val country: String?,
    val occurrenceType: String?,
    val hasCampaigns: Boolean?,
    val tasNumber: String?,
    val tasStatus: String?,
    val timeOpenProtocol: String?,
    val source: String?,
    val hasLink: Boolean?,
    val mainOccurrence: String?,
    val estimateTimeRepair: String?,
    val solutionProposed: String?,
    val mechanicLocation: String?,
    val towTruckLocation: String?,
    val checklist: String?,
    val customer: String?,
    val updatedAt: LocalDateTime?,
    val createdAt: LocalDateTime?,
    val protocolNumber: String?,
    val scheduleNumber: String?,
    val scheduleUuid: String?,
    val partnerId:String?,
    val driver: DriverResponse?,
    val vehicle: VehicleResponse?,
    val dtcs: List<DTCResponse>?,
    val occurrenceSteps: List<OccurrenceStepDetailResponse>?,
    val dealership: DealershipResponse?,
    val partOrder: PartOrderResponse?,
    val dispatches: List<OccurrenceDispatchResponse>?,
    val observation: String?,
    val status: String?,
    val serviceBaySchedule: ServiceBayScheduleResponse? = null,
    val failures: List<Failure>? = null,
    val partOrders: List<PartOrder>? = null,
    val partOrderDeliveryDates: List<PartOrderDeliveryDates>? = null,
    val finished: Boolean? = null,
    val finalizationReasonType: String? = null,
    val finalizationReasonDescription: String? = null
)

data class DriverResponse(
    val name: String?,
    val driverLicenseNumber: String?,
    val phone: String?,
    val checkInDriver: String?
)

data class VehicleResponse(
    val chassis: String?,
    val model: String?,
    val licensePlate: String?,
    val vehicleType: String?,
    val name: String?,
    val vehicleYear: Int?,
    val odometer: Int?,
    val hourMeter: Int?,
    val payloadType: String?,
    val maximumPayload: Int?,
    val criticalPayload: Boolean?,
    val stopped: Boolean?,
    val emissionStandard: String?
)

data class DTCResponse(
    val name: String,
    val spn: String,
    val fmi: Int
)

data class OccurrenceStepDetailResponse(
    val id: Int?,
    val stepId: String,
    val report: String?,
    val observation: String?,
    val dtStart: LocalDateTime,
    val expectedDtEnd: LocalDateTime?,
    val dtEnd: LocalDateTime?,
    val latest: Int,
    val estimatedTime: String?,
    val updatedBy: String?,
    val updatedByUuid: String?,
    val updatedAt: LocalDateTime?
)

data class DealershipResponse(
    val dn: String?,
    val regional: String?,
    val local: String?,
    val representative: String?,
    val cellNumber: String?,
    val area: String?,
    val name: String?
)

data class PartOrderResponse(
    val dtOrder: LocalDateTime?,
    val dtEstimate: LocalDateTime?,
    val dtDeliveryEstimate: LocalDateTime?,
    val status: String?,
    val orderNumber: String?,
    val statusOrder: String?,
    val occurrenceParts: List<PartResponse>?
)

data class PartResponse(
    val partNumber: String?,
    val quantity: Int
)

data class OccurrenceDispatchResponse(
    val uuid: String?,
    val authorizePayment: Boolean?,
    val reasonRefusal: String?,
    val descriptionRefusal: String?,
    val payer: String?,
    val type: String?,
    val status: String?,
    val route: String?,
    val dn: String?,
    val driver: String?
)

data class OccurrenceStatsResponse(
    val chassisListOccurrencesInProgress: List<String>,
    val chassisListOccurrencesNotStarted: List<String>,
    val chassisListOccurrencesDelayed: List<String>,
)

data class OccurrenceWithMinutesResponse(
    val occurrenceUuid: String,
    val totalMinutes: Long,
    val customer: String?,
    val model: String?,
    val legislation: String?,
    val city: String?,
    val state: String?,
    val chassis: String?,
    val dealershipName: String?,
    val dn: String?,
    val steps: List<OccurrenceStepWithMinutesResponse>?
)

data class OccurrenceStepWithMinutesResponse(
    val stepId: String,
    val totalMinutes: Long,
    val stepStart: LocalDateTime?,
    val hasFinished: Boolean?
)