package br.com.vw.uptime.schedule.infrastructure.services.asset

import br.com.vw.uptime.schedule.infrastructure.entities.asset.AssetMetricEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.AssetMetricRepository
import org.springframework.stereotype.Service

@Service
class AssetMetricService(
    private val assetMetricRepository: AssetMetricRepository
) {

    fun getMetricsByAssetIdList(assetIds:List<String>): List<AssetMetricEntity> {
        val assetIdsBatch = assetIds.chunked(40000)
        val assetMetricList = mutableListOf<AssetMetricEntity>()
        for(assetIdsPiece in assetIdsBatch) {
            val assetMetricPiece = assetMetricRepository.getByAssetIdList(assetIdsPiece)
            assetMetricList.addAll(assetMetricPiece)
        }
        return assetMetricList.toList()
    }
}