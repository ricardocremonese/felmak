package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.core.models.maintenance.AssetRequest
import br.com.vw.uptime.schedule.core.models.maintenance.VehicleCheckupInfo
import br.com.vw.uptime.schedule.infrastructure.services.checkup.VehicleInfoServiceImpl
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("v1/vehicle-checkup")
class VehicleCheckupController(
    private val vehicleInfoService: VehicleInfoServiceImpl
) {
    
    companion object {
        private val log: Logger = LoggerFactory.getLogger(VehicleCheckupController::class.java)
    }

    @PostMapping
    fun getVehicleCheckupInfo(assetRequest: AssetRequest): VehicleCheckupInfo {
        return vehicleInfoService.getVehicleCheckupInfoByChassis(assetRequest)
    }

    @PostMapping("/batch")
    fun getVehicleCheckupInfoBatch(@RequestBody request: BatchChassisRequest): ResponseEntity<List<VehicleCheckupInfo>> {
        return try {
            val checkupInfoList = vehicleInfoService.getVehicleCheckupInfoBatch(request.assets)
            ResponseEntity.ok(checkupInfoList)
        } catch (e: Exception) {
            log.error("Error getting batch vehicle checkup info: ${e.message}", e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @PostMapping("/overdue")
    fun getChassisWithOverdueCheckups(@RequestBody request: BatchChassisRequest): ResponseEntity<OverdueCheckupsResponse> {
        return try {
            val overdueChassis = vehicleInfoService.getChassisWithOverdueCheckups(request.assets.mapNotNull { it.identification })
            val response = OverdueCheckupsResponse(
                overdueChassis = overdueChassis,
                totalOverdue = overdueChassis.size
            )
            ResponseEntity.ok(response)
        } catch (e: Exception) {
            log.error("Error getting chassis with overdue checkups: ${e.message}", e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }
}

data class BatchChassisRequest(
    val assets: List<AssetRequest>
)

data class OverdueCheckupsResponse(
    val overdueChassis: List<String>,
    val totalOverdue: Int
) 