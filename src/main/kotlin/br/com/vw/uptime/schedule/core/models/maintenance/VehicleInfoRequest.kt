package br.com.vw.uptime.schedule.core.models.maintenance

import jakarta.validation.constraints.NotBlank

class VehicleInfoRequest {
    var assets:List<AssetRequest> = listOf()
}

class AssetRequest {
    @NotBlank
    lateinit var id:String
    var identification:String? = null
}