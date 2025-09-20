package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.entrypoint.requests.ChassisRequest
import br.com.vw.uptime.schedule.infrastructure.gateway.request.AccountIdsRequest
import br.com.vw.uptime.schedule.infrastructure.gateway.request.AssetIdsNullRequest
import br.com.vw.uptime.schedule.infrastructure.gateway.request.AssetIdsRequest
import br.com.vw.uptime.schedule.infrastructure.gateway.request.AssetsRequest
import br.com.vw.uptime.schedule.infrastructure.gateway.response.FaultCodesCardResponse
import br.com.vw.uptime.schedule.infrastructure.services.asset.AssetsDbService
import br.com.vw.uptime.schedule.infrastructure.services.report.*
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import kotlinx.coroutines.runBlocking

@RestController
@RequestMapping("/v1/big-numbers")
class BigNumbersController(
    val bigNumberService: BigNumberService,
    val rioBigNumberService: RioBigNumberService,
    val userAuthServiceImpl: UserAuthServiceImpl
) {

    @Value("\${tower-account-id}")
    private lateinit var towerAccountId: String

    @PostMapping("/vehicle/notice")
    fun get(@RequestBody assetIdsRequest: AssetIdsRequest) : FaultCodesCardResponse {
        return bigNumberService.getTotalVehiclesInAttention(assetIdsRequest)
    }
    
    @PostMapping("/vehicle/volks-total")
    fun getTotalVehicleWithVolksTotalPlan(@RequestBody assetsRequest:AssetsRequest) : BigNumbersResponse {
        return bigNumberService.getTotalVehicleWithVolksTotalPlan(assetsRequest)
    }

    @PostMapping("/rio")
    fun getRio(@RequestBody assetIdsRequest: AssetIdsRequest) : PlansBigNumberResponse {
        val user = userAuthServiceImpl.usr()
        
        // Check if the user is from the tower
        if (user.accountId == towerAccountId) {
            return runBlocking { rioBigNumberService.towerRioBigNumbers() }
        } else {
            return rioBigNumberService.rioBigNumbers(assetIdsRequest.assetIds.toList())
        }
    }

    @PostMapping("/vehicle/finished")
    fun getTotalVehicleFinished(@RequestBody assetIdsRequest: AssetIdsNullRequest) : BigNumbersAssetsIdsResponse {
        return bigNumberService.getTotalVehiclesFinishedByAccountId(
            userAuthServiceImpl.usr(),
            assetIdsRequest
        )
    }

    @PostMapping("/vehicle/field-campaign")
    fun getTotalVehicleWithFieldCampaign(@RequestBody chassisRequest: ChassisRequest) : BigNumbersResponse {
        return bigNumberService.getTotalVehicleWithFieldCampaign(chassisRequest)
    }

    @PostMapping("/vehicle/past-due-maintenance")
    fun getTotalVehiclePastDueMaintenance(@RequestBody assetsRequest: AssetsRequest) : BigNumbersResponse {
        val usr = userAuthServiceImpl.usr()
        return bigNumberService.getTotalVehiclePastDueMaintenance(assetsRequest, usr)
    }

    /* Deprecated: remove after 2025-07-14, replaced by OccurrenceController.getStats
    @PostMapping("/available-to-schedule")
    fun amountOfAvailableToSchedule(@RequestBody assetIdsRequest: AssetIdsNullRequest) : BigNumbersAssetsIdsResponse {
        return bigNumberService.getVehiclesAvailableToScheduleByAccountId(
            userAuthServiceImpl.usr(),
            assetIdsRequest
        )
    }

    @PostMapping("/vehicle/status")
    fun getVehicleByStatus(@RequestBody vehicleStatusRequest: VehicleStatusRequest) : VehicleStatusResponse {
        return bigNumberService.getVehiclesByStatus(vehicleStatusRequest)
    }

    @PostMapping("/vehicle/rio")
    fun getTotalVehicleWithRioPlan(@RequestBody assetIdsRequest: AssetIdsRequest) : BigNumbersResponse {
        return bigNumberService.getTotalVehicleWithRioPlan(assetIdsRequest)
    }

    @PostMapping("/vehicle/in-progress")
    fun getTotalVehicleInProgress(@RequestBody assetIdsRequest: AssetIdsNullRequest) : BigNumbersAssetsIdsResponse {
        return bigNumberService.getTotalVehiclesInMaintenanceByAccountId(
            userAuthServiceImpl.usr(),
            assetIdsRequest
        )
    }

    @PostMapping("/vehicle/delayed-maintenance")
    fun getTotalVehicleDelayedMaintenance(@RequestBody assetIdsRequest: AssetIdsNullRequest) : BigNumbersAssetsIdsResponse {
        return bigNumberService.getTotalVehicleDelayedMaintenanceByAccountId(
            userAuthServiceImpl.usr(),
            assetIdsRequest
        )
    }

    @PostMapping("/vehicle/scheduled")
    fun getTotalVehicleScheduled(@RequestBody assetIdsRequest: AssetIdsNullRequest) : BigNumbersAssetsIdsResponse {
        return bigNumberService.getTotalVehiclesScheduledByAccountId(
            userAuthServiceImpl.usr(),
            assetIdsRequest
        )
    }
    */
}