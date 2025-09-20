package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.infrastructure.services.asset.AssetsServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.checkup.FleetGroup
import br.com.vw.uptime.schedule.infrastructure.services.checkup.FleetGroupServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.asset.GroupAssets
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.enums.ParameterIn
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("/v1/fleet/groups")
class FleetGroupController(
    val fleetGroupServiceImpl: FleetGroupServiceImpl,
    val assetsServiceImpl: AssetsServiceImpl
) {


    @GetMapping("")
    fun groups(
        @RequestParam(name = "account_id", defaultValue = "") accountId:String
    ) : List<FleetGroup> {
        return fleetGroupServiceImpl.groups(accountId)
    }

    @GetMapping("/assets")
    @Operation(
        summary = "Example API",
        parameters = [
            Parameter(
                name = "search",
                description = "Search by asset (vehicle) name",
                `in` = ParameterIn.QUERY,
                allowEmptyValue = true,
                required = false,
            ),
            Parameter(
                name = "account_id",
                description = "Account ID",
                `in` = ParameterIn.QUERY,
                allowEmptyValue = true,
                required = false
            )
        ]
    )
    fun groupsByAssets(
        @RequestParam(name = "account_id", defaultValue = "", required = false) accountId:String,
        @RequestParam(name = "search", defaultValue = "", required = false) searchName:String,
    ) : List<GroupAssets> {
        return assetsServiceImpl.getGroupedAssetsByAccountId(accountId, searchName)
    }

}