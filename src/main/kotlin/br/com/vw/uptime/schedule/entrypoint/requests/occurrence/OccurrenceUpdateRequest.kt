package br.com.vw.uptime.schedule.entrypoint.requests.occurrence

import br.com.vw.uptime.schedule.core.utils.TimeUtils
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.Failure
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.PartOrder
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.PartOrderDeliveryDates
import br.com.vw.uptime.schedule.infrastructure.services.occurence.OccurrenceType
import jakarta.validation.Valid
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.LocalDateTime


class OccurrenceUpdateRequest {

    var criticality: Int? = null
    var osNumber: String? = null
    var osDtOpenAt: LocalDateTime? = null
    var renter: String? = null
    var literatureTroubleshooting: String? = null
    var country: String? = null
    var occurrenceType: OccurrenceType? = null
    var tasNumber: String? = null
    var tasStatus: String? = null
    @Pattern(regexp = TimeUtils.DURATION_PATTERN, message = "Formato da duração inválida. Esperado hh:mm")
    var timeOpenProtocol: String? = null
    var source: String? = null
    var hasLink: Boolean? = null
    var mainOccurrence: String? = null
    @Size(min = 0, max = 10000, message = "Limite de caracteres excedido")
    var observation: String? = null
    var status: String? = null

    @Pattern(regexp = TimeUtils.DURATION_PATTERN, message = "Formato da duração inválida. Esperado hh:mm")
    var estimateTimeRepair: String? = null
    @Size(min = 0, max = 10000, message = "Limite de caracteres excedido")
    var solutionProposed: String? = null
    var mechanicLocation: String? = null
    var towTruckLocation: String? = null
    var checklist: String? = null
    var customer: String? = null
    var partnerId: String? = null
    var driver: OccurrenceDriverUpdateRequest? = null
    var vehicle: OccurrenceVehicleUpdateRequest? = null
    var dtcs: MutableList<OccurrenceModuleUpdateRequest>? = null

    @Valid
    var occurrenceStep: OccurrenceStepUpdateRequest? = null
    var dealership: OccurrenceDealershipUpdateRequest? = null
    var partsOrder: OccurrencePartOrderUpdateRequest? = null
    var failures: List<Failure>? = null
    var partOrders: List<PartOrder>? = null
    var partOrderDeliveryDates: List<PartOrderDeliveryDates>? = null
}

class OccurrenceDriverUpdateRequest {

    var name: String? = null
    var driverLicenseNumber: String? = null
    var phone: String? = null
    var checkInDriver: String? = null
}

class OccurrenceVehicleUpdateRequest {

    var chassis: String? = null
    var model: String? = null
    var licensePlate: String? = null
    var vehicleType: String? = null
    var name: String? = null
    var vehicleYear: Int? = null
    var odometer: Int? = null
    var hourMeter: Int? = null
    var payloadType: String? = null
    var maximumPayload: Int? = null
    var criticalPayload: Boolean? = null
    var stopped: Boolean? = null
    var emissionStandard: String? = null
}

class OccurrenceModuleUpdateRequest {

    var name: String? = null
    var spn: String? = null
    var fmi: Int? = null
}

class OccurrenceStepUpdateRequest {

    @Size(min = 0, max = 10000, message = "Limite de caracteres excedido")
    var report: String? = null
    @Size(min = 0, max = 10000, message = "Limite de caracteres excedido")
    var observation: String? = null

    @Pattern(regexp = TimeUtils.DURATION_PATTERN, message = "Formato da duração inválida. Esperado hh:mm")
    var estimatedTime: String? = null

    var expectedEndDate: LocalDateTime? = null
}

class OccurrenceDealershipUpdateRequest {

    var dn: String? = null
    var regional: String? = null
    var cellNumber: String? = null
    var area: String? = null
    var local: String? = null
    var representative: String? = null
}

class OccurrencePartOrderUpdateRequest {

    var dtOrder: LocalDateTime? = null
    var dtEstimate: LocalDateTime? = null
    var dtDeliveryEstimate: LocalDateTime? = null
    var status: String? = null
    var orderNumber: String? = null
    var statusOrder: String? = null
    val occurrenceParts: List<OccurrencePartUpdateRequest>? = null
}

class OccurrencePartUpdateRequest {

    var partNumber:String? = null
    var quantity:Int? = 0

}