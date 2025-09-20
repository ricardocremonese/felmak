// src/main/kotlin/br/com/vw/uptime/schedule/entrypoint/controllers/MaintenanceController.kt

package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.infrastructure.gateway.request.AssetIdsRequest
import br.com.vw.uptime.schedule.infrastructure.gateway.response.ChamadoGrupoQuantidadeResponse
import br.com.vw.uptime.schedule.infrastructure.gateway.response.FaultCodesCardResponse
import br.com.vw.uptime.schedule.infrastructure.gateway.response.MaintenanceHistoryResponse
import br.com.vw.uptime.schedule.infrastructure.gateway.response.StepAverageTimeResponse
import br.com.vw.uptime.schedule.infrastructure.services.asset.PartsService
import br.com.vw.uptime.schedule.infrastructure.services.report.BigNumberService
import br.com.vw.uptime.schedule.infrastructure.services.maintenance.MaintenanceHistoryServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.maintenance.StepTimeService
import br.com.vw.uptime.schedule.entrypoint.responses.PartResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * Controller que expõe os endpoints de manutenção.
 */
@RestController
@RequestMapping("/v1/maintenance")
class MaintenanceController(
    private val bigNumberService: BigNumberService,
    private val maintenanceHistoryServiceImpl: MaintenanceHistoryServiceImpl,
    private val stepTimeService: StepTimeService,
    private val partsService: PartsService
) {


    @PostMapping("/status/vehicle/notice")
    fun getVehicleStatus(
        @RequestBody assetIdsRequest: AssetIdsRequest
    ): ResponseEntity<FaultCodesCardResponse> {
        return try {
            val response = bigNumberService.getTotalVehiclesInAttention(assetIdsRequest)
            ResponseEntity.ok(response)
        } catch (_: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    /**
     * Retorna o histórico de manutenção paginado.
     */
    @GetMapping("/history")
    fun getHistory(
        @RequestParam("page", defaultValue = "1") page: Int,
        @RequestParam("limit", defaultValue = "20") limit: Int,
        @RequestParam("sortDirection", defaultValue = "desc") sortDirection: String,
        @RequestParam("queryChassis", defaultValue = "") queryChassis: String,
        @RequestParam("date", defaultValue = "") date: String
    ): ResponseEntity<List<MaintenanceHistoryResponse>> {
        return try {
            val result = maintenanceHistoryServiceImpl.getFleetMaintenanceHistory(
                page, limit, sortDirection, queryChassis, date
            )
            ResponseEntity.ok(result)
        } catch (_: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    /**
     * Retorna a lista de etapas com seus tempos médios em segundos.
     */
    @GetMapping("/steps/average-time")
    fun getAverageTimePerStep(): ResponseEntity<List<StepAverageTimeResponse>> {
        return try {
            val response = stepTimeService.getAverageTimePerStep()
            ResponseEntity.ok(response)
        } catch (_: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    /**
     * Retorna as peças de manutenção por modelo e intervalo de quilometragem.
     */
    @GetMapping("/parts")
    fun getParts(
        @RequestParam("modelUuid", required = true) modelUuid: String,
        @RequestParam("kmStart", required = true) kmStart: Long,
        @RequestParam("kmEnd", required = true) kmEnd: Long
    ): ResponseEntity<List<PartResponse>> {
        return try {
            val response = partsService.getPartsByModelUuidAndRangeKm(modelUuid, kmStart, kmEnd)
            ResponseEntity.ok(response.map { PartResponse(it.maintenanceParts?.description ?: "", it.maintenanceParts?.model ?: "", it.maintenanceParts?.code ?: "") })
        } catch (e: Exception) {
            println("Error: ${e}")
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }
}
