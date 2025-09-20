package br.com.vw.uptime.schedule.infrastructure.repositories.assets

import br.com.vw.uptime.schedule.infrastructure.entities.asset.AssetMetricEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface AssetMetricRepository : JpaRepository<AssetMetricEntity, String> {

    fun getByAssetId(assetId:String) : AssetMetricEntity?

    @Query(
        """
            select
                *
            from
                asset_metric
            where
                asset_id in (:assetIds)
        """,
        nativeQuery = true
    )
    fun getByAssetIdList(
        @Param("assetIds")
        assetIds:List<String>
    ) : List<AssetMetricEntity>
}