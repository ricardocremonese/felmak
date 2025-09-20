package br.com.vw.uptime.schedule.infrastructure.services.asset

import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.enums.checkups.MaintenanceGroupEnum
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.PartsEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.UptimeAssetRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.MaintenancePartsRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.ModelCodeRepository
import org.springframework.stereotype.Service


@Service
class PartsService(
    private val maintenancePartsRepository: MaintenancePartsRepository,
    private val modelCodeRepository: ModelCodeRepository,
    private val uptimeAssetRepository: UptimeAssetRepository) {

    fun getPartsByModelCode(modelCode: String, maintenanceGroup: MaintenanceGroupEnum, nextCheckupStartRange:Long): List<PartsEntity> {
        return modelCodeRepository.findByModelCode(modelCode)?.let { modelCodeEntity ->
            modelCodeEntity.modelId?.let { modelId ->
                maintenancePartsRepository.findByModelUuidGroupAndKm(modelId, maintenanceGroup.name.uppercase(), nextCheckupStartRange)
            } ?: emptyList()
        } ?: emptyList()
    }

    fun getPartsByChassis(chassis: String, maintenanceGroupId: String, nextCheckupStartRange:Long): List<PartsEntity> {
        return uptimeAssetRepository.findByChassis(chassis)?.let {
            val modelCode = it.odp?.modelCode ?: throw BusinessException(ErrorCode.MODEL_NOT_FOUND_BY_CHASSIS.toResponse())
            getPartsByModelCode(modelCode, MaintenanceGroupEnum.byId(maintenanceGroupId), nextCheckupStartRange)
        } ?: emptyList()
    }

    fun getPartsByPartNumber(partNumber: String): List<PartsEntity>  = maintenancePartsRepository.findByPartNumber(partNumber = partNumber)

    fun getPartsByModelUuidAndRangeKm(modelUuid: String, kmStart: Long, kmEnd: Long): List<PartsEntity> {
        val groups = listOf("RODOVIARIO", "ESPECIAL", "MISTO", "SEVERO")
        val parts = mutableListOf<PartsEntity>()
        groups.forEach { group ->
            parts.addAll(maintenancePartsRepository.findByModelUuidGroupAndRangeKm(modelUuid, group, kmStart, kmEnd))
        }
        return parts
    }
}