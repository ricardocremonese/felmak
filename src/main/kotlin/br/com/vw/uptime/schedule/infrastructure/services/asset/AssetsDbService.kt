package br.com.vw.uptime.schedule.infrastructure.services.asset

import br.com.vw.uptime.schedule.core.converters.Mapping
import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.core.models.asset.*
import br.com.vw.uptime.schedule.core.models.asset.Asset
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.infrastructure.entities.asset.AssetEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.AssetsDbRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.AssetsDbRepository.AssetIdAndIdentification
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.servlet.http.HttpServletResponse
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.runBlocking
import org.springframework.stereotype.Service

@Service
class AssetsDbService(
    private val assetsDbRepository: AssetsDbRepository,
    private val objectMapper: ObjectMapper
) {

    fun getCustomerAsset(chassis:String, towerAccountId:String): Asset? {
        val assets = assetsDbRepository.getAssetByChassis(chassis)
        val assetEntity = assets.firstOrNull {
            it.accountId != towerAccountId
        }
        return assetEntity?.let {
            assetEntityToAsset(it)
        }
    }

    fun getAssetTower(towerAccountId:String, assets:List<AssetEntity>) : AssetEntity? {
        return assets.firstOrNull { asset ->
            asset.accountId == towerAccountId
        }
    }

    fun getCustomerAsset(towerAccountId:String, assets:List<AssetEntity>) : AssetEntity? {
        return assets.firstOrNull { asset ->
            asset.accountId != towerAccountId
        }
    }

    fun getTowerAsset(chassis:String, towerAccountId:String) : AssetEntity? {
        val assets = assetsDbRepository.getAssetByChassis(chassis)
        val assetEntity = assets.firstOrNull {
            it.accountId == towerAccountId
        }
        return assetEntity
    }

    fun getAssetByAccountIdAndAssetId(accountId:String, assetId:String): Asset {
        val assetEntity = assetsDbRepository.getAssetByAssetId(accountId, assetId)
            ?: throw BusinessException(
                ErrorCode.ASSET_NOT_FOUND.toResponse()
            )
        return assetEntityToAsset(assetEntity)
    }

    private fun assetEntityToAsset(assetEntity: AssetEntity): Asset {
        return Mapping.copy(
            assetEntity,
            Asset()
        ).apply {
            this.embedded = assetEntity.embedded?.let {
                Embedded().apply {
                    this.tags = Tags().apply {
                        this.items = it.tags?.items?.map {
                            GroupFleetIdData().apply {
                                this.id = it.id
                            }
                        } ?: emptyList()
                    }
                    this.masterData = it.masterData?.let {
                        MasterData().apply {
                            this.vehicleModel = it.vehicleModel
                        }
                    }
                }
            }
        }
    }

    fun getAssetIdsAccount(
        currentAsset: Asset,
        user: UserAuthenticate,
        controlTowerAccountId:String
    ) : AssetTowerAndCustomerIds {
        val assetTowerAndCustomerIds = AssetTowerAndCustomerIds()
        val chassis = currentAsset.identification
        if(controlTowerAccountId == user.accountId) {
            assetTowerAndCustomerIds.towerAccountId = currentAsset.accountId
            assetTowerAndCustomerIds.towerAssetId = currentAsset.id
            if (chassis != null) {
                val customerAsset = getCustomerAsset(
                    chassis,
                    currentAsset.accountId,
                )
                if(customerAsset != null) {
                    assetTowerAndCustomerIds.customerAssetId = customerAsset.id
                    assetTowerAndCustomerIds.customerAccountId = customerAsset.accountId
                }
            }
        } else {
            assetTowerAndCustomerIds.customerAssetId = currentAsset.id
            assetTowerAndCustomerIds.customerAccountId = currentAsset.accountId
            if(chassis != null) {
                val towerAsset = getTowerAsset(chassis, controlTowerAccountId)
                if(towerAsset != null) {
                    assetTowerAndCustomerIds.towerAccountId = controlTowerAccountId
                    assetTowerAndCustomerIds.towerAssetId = towerAsset.id
                }
            }
        }
        return assetTowerAndCustomerIds
    }

    fun getAssetIdsAccountByChassis(
        chassis: String,
        user: UserAuthenticate? = null,
        controlTowerAccountId:String
    ) : AssetTowerAndCustomerIds {
        val assets = assetsDbRepository.getAssetByChassis(chassis)

        val assetTowerAndCustomerIds = AssetTowerAndCustomerIds()
        val assetClient = getCustomerAsset(controlTowerAccountId, assets)
        val assetTower = getAssetTower(controlTowerAccountId, assets)

        assetTowerAndCustomerIds.customerAssetId = assetClient?.id
        assetTowerAndCustomerIds.customerAccountId = assetClient?.accountId

        assetTowerAndCustomerIds.towerAccountId = assetTower?.accountId
        assetTowerAndCustomerIds.towerAssetId = assetTower?.id

        return assetTowerAndCustomerIds
    }

    fun getAllByAccountId(usr:UserAuthenticate): List<Asset> {
        return this.assetsDbRepository.getAllByAccountId(usr.accountId).map {
            assetEntityToAsset(it)
        }
    }

    fun getAllByAccountId(accountId: String): List<Asset> {
        return this.assetsDbRepository.getAllByAccountId(accountId).map {
            assetEntityToAsset(it)
        }
    }

    fun getAllByAccountIdBuffered(usr:UserAuthenticate, response: HttpServletResponse) {

        val writer = response.writer
        val jsonGen = objectMapper.factory.createGenerator(writer)
        val seqWriter = objectMapper.writer().writeValuesAsArray(jsonGen)

        val channel = Channel<AssetEntity>(capacity = 1000) // small buffer

        runBlocking {
            assetsDbRepository.getAllByAccountIdBufferedAsync(
                usr.accountId,
                channel
            ) {
                for (item in channel) {
                    seqWriter.write(
                        assetEntityToAsset(item)
                    )
                }
                jsonGen.writeEndArray()
                jsonGen.flush()
                writer.flush()
            }
        }
    }
    
    fun getAssetIdAndIdentification(): List<AssetIdAndIdentification> {
        return this.assetsDbRepository.getAssetIdAndIdentification()
    }
}

class AssetTowerAndCustomerIds {
    var customerAccountId:String? = null
    var customerAssetId:String? = null
    var towerAccountId:String? = null
    var towerAssetId:String? = null
}