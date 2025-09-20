package br.com.vw.uptime.schedule.infrastructure.services.asset

import br.com.vw.uptime.schedule.core.converters.Mapping
import br.com.vw.uptime.schedule.infrastructure.entities.asset.UptimeAssetEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.UptimeAsset
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.UptimeAssetRepository
import org.springframework.stereotype.Service

@Service
class UptimeAssetServiceImpl(
    val uptimeAssetRepository: UptimeAssetRepository,
) {

    fun getByChassisList(chassisList: Set<String?>): List<UptimeAsset> {
        return uptimeAssetRepository.getByChassisList(chassisList.filterNotNull())
    }

    fun update(uptimeAsset: UptimeAsset) {
        val item = uptimeAssetRepository.findByChassis(uptimeAsset.chassis)
        uptimeAssetRepository.save(mergeUptimeAssets(item, uptimeAsset))
    }
}

fun mergeUptimeAssets(entity: UptimeAssetEntity?, updatedUptimeAsset: UptimeAsset): UptimeAssetEntity {
    return entity?.apply {
        this.odometer = updatedUptimeAsset.odometer ?: entity.odometer
        this.lastOdometerUpdate = updatedUptimeAsset.lastOdometerUpdate ?: entity.lastOdometerUpdate
        this.hourmeter = updatedUptimeAsset.hourmeter ?: entity.hourmeter
        this.lastHourmeterUpdate = updatedUptimeAsset.lastHourmeterUpdate ?: entity.lastHourmeterUpdate
    } ?: Mapping.copy(updatedUptimeAsset, UptimeAssetEntity())
}