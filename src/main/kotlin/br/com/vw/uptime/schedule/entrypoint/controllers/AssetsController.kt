package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.entrypoint.requests.ChassisRequest
import br.com.vw.uptime.schedule.entrypoint.responses.ModelResponse
import br.com.vw.uptime.schedule.entrypoint.responses.VehicleWithMetricsResponse
import br.com.vw.uptime.schedule.infrastructure.gateway.request.AssetIdsRequest
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.UptimeAsset
import br.com.vw.uptime.schedule.infrastructure.services.TableCopyService
import br.com.vw.uptime.schedule.infrastructure.services.asset.*
import br.com.vw.uptime.schedule.infrastructure.services.checkup.VehicleGeoLocation
import br.com.vw.uptime.schedule.infrastructure.services.maintenance.ModelCodeService
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/v1/assets")
class AssetsController(
    val assetsServiceImpl: AssetsServiceImpl,
    val uptimeAssetServiceImpl: UptimeAssetServiceImpl,
    val odometerService: OdometerService,
    val tableCopyService: TableCopyService,
    val modelCodeService: ModelCodeService,
    val userAuthServiceImpl: UserAuthServiceImpl
) {

    @Value("\${tower-account-id}")
    private lateinit var towerAccountId: String


    @GetMapping("{assetId}")
    fun getAssetById(@PathVariable("assetId") assetId: String) : Asset {
        return assetsServiceImpl.getAssetById(assetId)
    }

    @GetMapping("/group")
    fun assetsByGroupId(
        @RequestParam(name = "account_id", defaultValue="") accountId:String,
        @RequestParam(name = "group_id", defaultValue = "") groupId:String
    ) : List<Asset> {
        return assetsServiceImpl.getAssetsByGroupId(accountId, groupId)
    }

    @GetMapping("/group/all")
    fun assetsByGroupIdAll() : List<Asset> {
        return assetsServiceImpl.getAssetsAll()
    }

    @GetMapping("")
    fun getAllAssetsByGroupId(
        @RequestParam(name = "vin", defaultValue="") vin:String
    ) : List<Asset> {

        if(vin.isEmpty()) {
            return assetsServiceImpl.getAssets()
        }

        return arrayListOf(assetsServiceImpl.assetByVin(vin))
    }

    @PostMapping("uptime")
    fun getUptimeAssetsByChassisList(@RequestBody chassisRequest: ChassisRequest) : List<UptimeAsset> {
        return uptimeAssetServiceImpl.getByChassisList(chassisRequest.chassisList)
    }

    @PutMapping("uptime/{chassis}")
    fun updateUptimeAsset(@PathVariable("chassis") chassis:String, @RequestBody uptimeAsset: UptimeAsset) {
        uptimeAssetServiceImpl.update(uptimeAsset)
    }

    @GetMapping("{assetId}/geo-location")
    fun getGeoLocationByAssetId(@PathVariable("assetId") assetId: String) : VehicleGeoLocation {
        return assetsServiceImpl.getAssetGeoLocation(assetId)
    }

    @PostMapping("/connection-status")
    fun getAssetsConnectionStatus(@RequestBody assetIdsRequest: AssetIdsRequest) : List<AssetConnectionStatus> {
        return assetsServiceImpl.getAssetsConnectionStatus(assetIdsRequest.assetIds.toList())
    }

    @PostMapping("/plans")
    fun getAssetsPlans(@RequestBody assetIdsRequest: AssetIdsRequest) : List<AssetPlan> {
        val user = userAuthServiceImpl.usr()
        if(user.accountId != towerAccountId) {
            return assetsServiceImpl.getAssetsPlans(assetIdsRequest.assetIds.toList())
        } else {
            return assetsServiceImpl.getTowerAssetsPlans(assetIdsRequest.assetIds.toList())
        }
    }

    @PostMapping("/metrics")
    fun getAssetsMetrics(@RequestBody assetIdsRequest: AssetIdsRequest) : List<AssetMetrics> {
        return odometerService.odometerHourMeterByAssetsId(assetIdsRequest.assetIds.toList())
    }

    @PostMapping("/summary")
    fun getVehiclesSummary(
        @RequestBody assetIdsRequest: AssetIdsRequest,
        @RequestParam(name = "without_account", defaultValue = "false") withoutAccount: Boolean,
        @RequestParam(name = "use_history", defaultValue = "true") useHistory: Boolean
    ): List<VehicleWithMetricsResponse> {
        return assetsServiceImpl.getVehiclesSummary(assetIdsRequest.assetIds.toList(), withoutAccount, useHistory)
    }

    @GetMapping("/models")
    fun getAllModels(): List<ModelResponse> {
        return modelCodeService.findAllModels().map { model ->
            ModelResponse(
                modelCode = model.modelCode,
                segment = model.segment,
                description = model.description,
                modelId = model.modelId
            )
        }
    }

}
