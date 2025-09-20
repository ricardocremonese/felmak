package br.com.vw.uptime.schedule.entrypoint.requests.assistance

import br.com.vw.uptime.schedule.core.models.assistance.enums.AssistanceOccurrenceType
import br.com.vw.uptime.schedule.entrypoint.validator.Matches
import jakarta.validation.Valid
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

class AssistanceCreationRequest {

    /**
     * Control tower assetId
     */
    @NotBlank
    var assetId:String? = null
    @NotNull
    var occurType: AssistanceOccurrenceType? = null
    @Valid
    @NotNull
    var vehicle:VehicleAssistance? = null
    @Valid
    var driver:DriverRequest? = null
    @Valid
    @NotNull
    var occurrence:Occurrence? = null
    @Valid
    var dispatch:AssistanceDispatchRequest? = null
    @NotNull
    @Min(1, message = "Prioridade deve ser entre 1 e 5")
    @Max(5, message = "Prioridade deve ser entre 1 e 5")
    var priority:Int? = null
    var scheduledBy:String? = null
}

class AssistanceUpdateRequest {

    @Valid
    @NotNull
    var vehicle:VehicleAssistance? = null
    @Valid
    var driver:DriverRequest? = null
    @Valid
    @NotNull
    var occurrence:Occurrence? = null
    @Valid
    var dispatch:AssistanceDispatchRequest? = null
    @NotNull
    @Min(1, message = "Prioridade deve ser entre 1 e 5")
    @Max(5, message = "Prioridade deve ser entre 1 e 5")
    var priority:Int? = null
}

class VehicleAssistance {
    @NotBlank
    var customer:String? = null
    @NotBlank
    var vehicleType:String? = null
    @NotBlank
    var contactType:String? = null
    @NotBlank
    var requestedCountry:String? = null
    var vehiclePlate:String? = null
    var vehicleModel:String? = null
    var vehicleYear:Int? = null
    var odometer:Double? = null
    var hourMeter:Double? = null
}

class Occurrence {
    @NotNull
    var hasBound:Boolean? = null
    @NotBlank
    var origin:String? = null
    @NotBlank
    var subject:String? = null
    @NotBlank
    var mainOccurrence:String? = null
    @NotBlank
    @Size(min = 1, max = 200, message = "Limite de 200 caracteres excedido")
    var customerRequest:String? = null
    @Valid
    @NotNull
    var dtcs:List<DTCRequest> = arrayListOf()
    @NotBlank
    @Size(min = 1, max = 1000, message = "Limite de 1000 caracteres excedido")
    var diagnosis:String? = null
    @Size(min = 1, max = 1000, message = "Limite de 1000 caracteres excedido")
    var partsCode:String? = null
    @Size(min = 1, max = 1000, message = "Limite de 1000 caracteres excedido")
    var givenSolution:String? = null
    var load:String = ""
    @NotNull
    var loadWeight:Double? = null
    @NotNull
    var criticalLoad:Boolean? = null
}

class DriverRequest {
    @NotBlank
    var name: String = ""
    var cnh: String = ""
    @Pattern(regexp = "^((?!\\.)[\\w\\-_.]*[^.])(@\\w+)(\\.\\w+(\\.\\w+)?[^.\\W])\$", message = "E-mail inválido")
    var email: String = ""
    var phone: String = ""
}

class DTCRequest {
    @NotBlank
    var module:String? = null
    @NotBlank
    var dtcName:String? = null
    @NotBlank
    var fmi:String? = null
}

class AssistanceDispatchRequest {
    @NotBlank
    var dealershipId:String? = null
    @Valid
    @NotNull
    var vehicleLocation:VehicleLocationRequest? = null
}

class VehicleLocationRequest {
    @NotNull
    var street:String? = null
    @NotNull
    var neighbourhood:String? = null
    @NotNull
    var city:String? = null
    @NotNull
    var state:String? = null
    @NotNull
    var latitude:Double? = null
    @NotNull
    var longitude:Double? = null
}