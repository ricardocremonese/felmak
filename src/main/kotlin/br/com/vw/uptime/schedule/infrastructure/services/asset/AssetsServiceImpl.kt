package br.com.vw.uptime.schedule.infrastructure.services.asset

import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.models.maintenance.AssetExtern
import br.com.vw.uptime.schedule.core.models.maintenance.AssetHistExtern
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.AssetsRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.VehicleStatusData
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.FleetGroupData
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.FleetGroupsRepository
import br.com.vw.uptime.schedule.infrastructure.services.checkup.PlanMaintenance
import br.com.vw.uptime.schedule.infrastructure.services.checkup.PlanServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.checkup.VehicleGeoLocation
import br.com.vw.uptime.schedule.infrastructure.services.account.AccountService
import br.com.vw.uptime.schedule.infrastructure.services.asset.AssetsDbService
import br.com.vw.uptime.schedule.infrastructure.services.cache.CacheService
import br.com.vw.uptime.schedule.entrypoint.responses.VehicleWithMetricsResponse
import com.fasterxml.jackson.annotation.JsonProperty
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class AssetsServiceImpl(
    val assetsRepository: AssetsRepository,
    val fleetGroupsRepository:FleetGroupsRepository,
    val associationService: AssociationService,
    val planServiceImpl: PlanServiceImpl,
    val odometerService: OdometerService,
    val odpDbService: OdpDbService,
    val accountService: AccountService,
    val assetsDbService: AssetsDbService,
    val cacheService: CacheService
) {

    @Value("\${tower-account-id}")
    private lateinit var controlTowerAccountId: String

    fun assetByVin(vin:String) : Asset {
        val assetExtern = getAssetOrThrow(vin)
        val vehicleStatus = assetsRepository.getVehicleStatus(listOf(assetExtern.id)).firstOrNull()
        return Asset(assetExtern)
    }

    fun getAssetOrThrow(vin:String) : AssetExtern {
            return assetsRepository.getAssetByVin(vin)
            ?: throw BusinessException(
                ErrorCode.ASSET_NOT_FOUND.toResponse()
            )
    }

    fun getGroupedAssetsByAccountId(accountId:String, searchName:String) : List<GroupAssets> {
        val allAssets = assetsRepository.getVehicleAssets()
        val filteredAssets = if(searchName != "")
            allAssets.filter {
                it.name.contains(searchName, ignoreCase = true)
            } else allAssets

        val allGroups = fleetGroupsRepository.getFleetGroupsByAccountId(accountId)
        return allGroups.map {
            GroupAssets(it, filteredAssets)
        }
    }

    fun getAssetHistory() : AssetHistExtern? {
        return assetsRepository.getAssetsHistory().firstOrNull()
    }

    fun getAssetsByGroupId(accountId: String, groupId: String): List<Asset> {
        val allAssets = assetsRepository.getVehicleAssets()
        return AssetsByGroup(allAssets).get(groupId, "")
    }

    fun getAssets(): List<Asset> {
        val allAssets = assetsRepository.getVehicleAssets()
        return allAssets.map {
            Asset(it)
        }
    }

    fun getAssetsAll(): List<Asset> {
        val allAssets = arrayListOf<AssetExtern>()
        var after:String? = null
        do {
            val currentAssets = assetsRepository.getAfterVehicleAssets(after)
            after = currentAssets.lastOrNull()?.id
            allAssets.addAll(currentAssets)
        } while (after != null)
        return allAssets.map {
            Asset(it)
        }
    }

    fun getAssetsAllWithAccountService(): List<Asset> {
        val allAssets = arrayListOf<AssetExtern>()
        var after:String? = null
        do {
            val currentAssets = assetsRepository.getAfterVehicleAssets(after)
            after = currentAssets.lastOrNull()?.id
            allAssets.addAll(currentAssets)
        } while (after != null)
        return allAssets.map {
            Asset(it, assetsDbService, accountService, controlTowerAccountId)
        }
    }

    private fun hoursToLong(hours: String?): Long? {
        if(hours?.contains("-") == false) {
            return hours.split(":")[0].toLong()
        }
        return null
    }

    fun getAssetById(assetId: String) : Asset {
        val assetExtern = assetsRepository.getAssetByAssetId(assetId) ?: throw BusinessException(
            ErrorCode.ASSET_NOT_FOUND.toResponse()
        )
        return Asset(assetExtern)
    }

    fun getVehicleStatus(assetsId:List<String>) : List<VehicleStatus> {
        return assetsRepository.getVehicleStatus(assetsId).map {
            toVehicleStatus(it)
        }
    }

    fun getVehicleStatusByAssetIdAndAccountId(assetId:String, accountId:String, token:String) : VehicleStatus? {
        return assetsRepository.getVehicleStatusByAssetIdAndAccountId(assetId, accountId, token)?.let {
            toVehicleStatus(it)
        }
    }

    fun toVehicleStatus(vehicleStatusData: VehicleStatusData) : VehicleStatus {
        return vehicleStatusData.let {
            VehicleStatus(
                assetId = it.vehicleId,
                vehicle = it.vehicle,
                status = it.status,
                nextService = it.nextService,
                engineHours =  hoursToLong(it.engineHours),
                totalDistance = distanceToLong(it.totalDistance),
                distanceFromDealership = distanceDealershipToDouble(it.distanceFromDealership),
                dealershipCity = it.dealershipCity,
                dealershipName = it.dealershipName
            )
        }
    }

    fun getAssetGeoLocation(assetId: String) : VehicleGeoLocation {
        val assets = assetsRepository.getAssetsHistory()
        val asset = assets.firstOrNull {
            it.assetId == assetId
        }
        return with(VehicleGeoLocation()) {
            lat = asset?.position?.value?.latitude ?: 0.0
            lng = asset?.position?.value?.longitude ?: 0.0
            this
        }
    }

    fun getAssetsConnectionStatus(assetIds: List<String>) : List<AssetConnectionStatus> {
        val associations = associationService.allAssociations()
        return assetIds.map { assetId ->
            val association = associationService.associationByAssetId(assetId, associations)
            val connection = if (association != null) "Conectado" else "Desconectado"
            AssetConnectionStatus(assetId, connection)
        }
    }

    fun getAssetsPlans(assetIds: List<String>) : List<AssetPlan> {
        val plansAndAssets = planServiceImpl.getPlansAndAssets()

        return assetIds.map { assetId ->
            val plan = planServiceImpl.getPlansByAssetId(assetId, plansAndAssets)
            AssetPlan(assetId, plan)
        }
    }

    fun getTowerAssetsPlans(assetIds: List<String>) : List<AssetPlan> {

        var allAssetIdentifications = cacheService.getAssetIdAndIdentification(controlTowerAccountId)
        var subscriptions = cacheService.getSubscriptions()

        if(allAssetIdentifications == null) {
            allAssetIdentifications = assetsDbService.getAssetIdAndIdentification()
            cacheService.setAssetIdAndIdentification(controlTowerAccountId, allAssetIdentifications)
        }

        if(subscriptions == null) {
            subscriptions = planServiceImpl.getSubscriptions()
            cacheService.setSubscriptions(subscriptions)
        }

        val fleetAssets = allAssetIdentifications?.filter { it.accountId !== controlTowerAccountId } ?: emptyList()
        val towerAssets = allAssetIdentifications?.filter { it.accountId == controlTowerAccountId } ?: emptyList()

        val chassisList = towerAssets.filter { asset -> assetIds.contains(asset.id) }.map { it.identification }
        val ids = fleetAssets.filter { asset -> chassisList.contains(asset.identification) }.map { it.id }

        return ids.map { assetId ->
            val plan = subscriptions.filter { it.assets.contains(assetId) }
            AssetPlan(
                assetId, 
                plan.map {
                with(PlanMaintenance()) {
                    this.productId = it.product.sku
                    this.productName = it.product.name
                    this
                }
            })
        }
    }

    private fun distanceDealershipToDouble(totalDistance: String?): Double? {
        if (totalDistance?.contains("-") == false) {
            if(totalDistance.contains(" km")) {
                return totalDistance
                    .replace(" km", "")
                    .replace(",", "")
                    .toDouble()
            }
            if(totalDistance.contains(" m")) {
                return totalDistance
                    .replace(" m", "")
                    .toDouble() / 1000
            }
        }
        return null
    }

    private fun distanceToLong(totalDistance: String?): Long? {
        if (totalDistance?.contains("-") == false) {
            return totalDistance
                .replace(" km", "")
                .replace(".", "")
                .toLong()
        }
        return null
    }

    fun getVehiclesSummary(assetIds: List<String>, withoutAccount: Boolean = false, useHistory: Boolean = true): List<VehicleWithMetricsResponse> {
        val allAssets = if(withoutAccount) getAssetsAll() else getAssetsAllWithAccountService()
        val filteredAssets = allAssets.filter { asset ->
            assetIds.contains(asset.getId())
        }
        val assetMetrics = odometerService.odometerHourMeterByAssetsId(assetIds, useHistory)
        val chassisList = filteredAssets.mapNotNull { it.getIdentification() }
        val odpData = odpDbService.getCheckupOdpByChassisList(chassisList)

        return filteredAssets.map { asset ->
            val metrics = assetMetrics.firstOrNull { it.assetId == asset.getId() }
            val odpInfo = odpData.firstOrNull { it.chassis == asset.getIdentification() }

            val accountNameAndAssetId = asset.getAccountNameAndAssetId()
            
            VehicleWithMetricsResponse(
                id = asset.getId(),
                name = asset.getName(),
                identification = asset.getIdentification(),
                licensePlate = asset.getLicencePlate(),
                odometer = metrics?.vehicleMetrics?.odometer?.toLong(),
                hourmeter = metrics?.vehicleMetrics?.hourMeter?.toLong(),
                model = odpInfo?.modelDescription,
                modelCode = odpInfo?.modelCode,
                saleDate = odpInfo?.order?.saleOrder,
                accountId = asset.getAccountId(),
                accountName = accountNameAndAssetId[0],
                accountAssetId = accountNameAndAssetId[1]
            )
        }
    }
}

class AssetsByGroup(
    private val allAssets:List<AssetExtern>
) {
    fun get(groupId: String, groupName: String): List<Asset> {
        if(groupId == "") {
            return allAssets.filter {
                it.embedded?.tags?.items?.isEmpty() ?: true
            }
            .map {
                Asset(it)
            }
        }
        return allAssets
            .filter { asset ->
                asset.embedded?.tags?.items?.any {
                    it.id == groupId
                } ?: false
            }
            .map {
                Asset(it)
            }
    }
}

class GroupAssets(
    private val fleetGroupData:FleetGroupData,
    private val allAssets:List<AssetExtern>
) {

    fun getName() : String {
        return fleetGroupData.name
    }

    fun getAssets() : List<Asset> {
        return AssetsByGroup(allAssets).get(fleetGroupData.id, "")
    }
}

class Asset(
    private val assetExtern: AssetExtern,
    private val assetsDbService: AssetsDbService? = null,
    private val accountService: AccountService? = null,
    private val controlTowerAccountId: String? = null
) {
    fun getId():String {
        return assetExtern.id
    }

    fun getIdentification() : String? {
        return assetExtern.identification
    }

    fun getName():String {
        return assetExtern.name
    }

    fun getBrand():String? {
        return assetExtern.brand
    }

    fun identificationType() : String {
        return  assetExtern.identificationType
    }

    @JsonProperty("license_plate")
    fun getLicencePlate():String? {
        return assetExtern.licensePlate
    }

    @JsonProperty("license_plate_country_code")
    fun licensePlateCountryCode() : String? {
        return assetExtern.licensePlateCountryCode
    }

    fun getType():String {
        return assetExtern.type
    }

    fun getGroupIds() : List<String> {
        return this.assetExtern.embedded?.let {
            it.tags.items.map { groupIds ->
                groupIds.id
            }
        } ?: listOf()
    }

    fun getStatus() : String {
        return assetExtern.status
    }

    fun getAccountId() : String {
        return assetExtern.accountId
    }

    fun getAccountNameAndAssetId() : List<String> {
        if(accountService == null || assetsDbService == null || controlTowerAccountId == null) {
            return listOf("", "")
        }
        
        val assetIdsAccount = assetsDbService.getAssetIdsAccountByChassis(
            assetExtern.identification!!,
            null,
            controlTowerAccountId
        )

        return listOf(
            accountService.getAccountName(assetIdsAccount.customerAccountId ?: "") ?: "",
            assetIdsAccount.customerAssetId ?: ""
        )
    }
}

class VehicleStatus(
    val assetId:String,
    val vehicle:String?,
    val status:String?,
    val engineHours:Long?,
    val totalDistance:Long?,
    val distanceFromDealership:Double?,
    val nextService:String?,
    val dealershipCity:String?,
    val dealershipName:String?
)

class Status (
    val odometer:Double?,
    val hourMeter:Long?
)

class AssetConnectionStatus(
    val assetId:String,
    val connection:String
)

class AssetPlan(
    val assetId:String,
    val plan:List<PlanMaintenance>,
)