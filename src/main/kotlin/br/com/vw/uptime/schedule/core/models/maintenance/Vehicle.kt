package br.com.vw.uptime.schedule.core.models.maintenance

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

class Vehicle {

    @NotBlank
    var assetId:String = ""
    var chassis:String? = null
    var plate:String? = null
    var vehicleModel:String? = null
    var vehicleYear: Int? = null
    var odometer: Long? = null
    var hourMeter: Long? = null

    /**
     * Rodoviário, Especial, Misto, Severo
     */
    @NotBlank
    var vehicleGroup:String = ""
    var vehicleGroupId:String = ""
    
    @NotNull
    var groups: List<String> = emptyList()
    
    @NotBlank
    var name:String? = ""
}