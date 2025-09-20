package br.com.vw.uptime.schedule.infrastructure.services.report

import br.com.vw.uptime.schedule.core.models.asset.Asset
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.AssetPeriodData
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.PeriodData
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.SubscriptionData
import br.com.vw.uptime.schedule.infrastructure.services.asset.AssetsDbService
import br.com.vw.uptime.schedule.infrastructure.services.cache.CacheService
import br.com.vw.uptime.schedule.infrastructure.services.cache.CacheManagementService
import br.com.vw.uptime.schedule.infrastructure.services.checkup.PlanNumbers
import br.com.vw.uptime.schedule.infrastructure.services.checkup.PlanServiceImpl
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class RioBigNumberService(
    private val planServiceImpl: PlanServiceImpl,
    private val assetsDbService: AssetsDbService,
    private val cacheService: CacheService,
    private val cacheManagementService: CacheManagementService
) {

    @Value("\${tower-account-id}")
    private lateinit var towerAccountId: String

    fun rioBigNumbers(assetIds:List<String>) : PlansBigNumberResponse {
        val plansAndAssetsList = planServiceImpl.getPlansAndAssets()
        val productWithPlans = planServiceImpl.getAllActivePlans()
        val filteredPlans = filterActivePlans(plansAndAssetsList, productWithPlans)
        val planTotalAndAssetsList = arrayListOf<PlanTotalAndAssets>()
        for(planAndAssets in filteredPlans) {
            val assetIdsWithPlans = getAssetsFromPeriodsPlan(assetIds, planAndAssets.periods)
            val planTotalAndAssets = PlanTotalAndAssets(
                name = planAndAssets.productName,
                assetIds = assetIdsWithPlans.distinct(),
                total = assetIdsWithPlans.distinct().size
            )
            planTotalAndAssetsList.add(planTotalAndAssets)
        }
        return PlansBigNumberResponse(
            plans = planTotalAndAssetsList
        )
    }

    suspend fun towerRioBigNumbers() : PlansBigNumberResponse = coroutineScope {
        // Get from cache
        var allAssetIdentifications = cacheService.getAssetIdAndIdentification(towerAccountId)
        var subscriptions = cacheService.getSubscriptions()
        
        // If not in cache, search normally and save
        if (allAssetIdentifications == null) {
            allAssetIdentifications = assetsDbService.getAssetIdAndIdentification()
            cacheService.setAssetIdAndIdentification(towerAccountId, allAssetIdentifications)
        }
        
        if (subscriptions == null) {
            subscriptions = planServiceImpl.getSubscriptions()
            cacheService.setSubscriptions(subscriptions)
        }

        // Update cache in background for next request
        cacheManagementService.refreshAssetIdAndIdentificationCache(towerAccountId)
        cacheService.updateSubscriptionsInBackground { token ->
            planServiceImpl.getSubscriptions(token)
        }
        
        // Search data that is not cached
        val productWithPlans = planServiceImpl.getAllActivePlans()
        val filteredPlans = filterActivePlansBySubscription(subscriptions, productWithPlans)
        
        // Group all plans by name across all accounts
        val allPlansGrouped = filteredPlans.groupBy { it.product.name }
        val plansList = arrayListOf<PlanTotalAndAssets>()
        for ((planName, planSubscriptions) in allPlansGrouped) {
            // Get all assets for this plan across all accounts
            val allAssetIds = planSubscriptions.flatMap { it.assets }.distinct()
            val assetIds = allAssetIdentifications.filter { asset -> allAssetIds.contains(asset.accountAssetId) }.map { it.id }
            val planData = PlanTotalAndAssets(
                name = planName,
                total = assetIds.size,
                assetIds = assetIds
            )
            plansList.add(planData)
        }
        PlansBigNumberResponse(
            plans = plansList
        )
    }

    private fun getAssetsFromPeriodsPlan(assetsToFilter: List<String>, periods: List<PeriodData>): List<String> {
        return periods.flatMap { period ->
            FilteredAssetIds(
                assetIdsToFilter = assetsToFilter,
                allAssetIds = period.assets.map { it.assetId }
            ).assetIds()
        }
    }

    private fun filterActivePlans(
        plansAndAssetsList:List<AssetPeriodData>,
        allActivePlans:List<PlanNumbers>
    ): List<AssetPeriodData> {
        return plansAndAssetsList.filter { planAndAssets ->
            allActivePlans.any {
                planAndAssets.productName == it.productName
            }
        }
    }

    private fun filterActivePlansBySubscription(
        subscriptions:List<SubscriptionData>,
        allActivePlans:List<PlanNumbers>
    ): List<SubscriptionData> {
        return subscriptions.filter { subscription ->
            allActivePlans.any {
                subscription.product.name == it.productName
            }
        }
    }
}

class PlansBigNumberResponse(
    val plans: List<PlanTotalAndAssets>
)

class PlanTotalAndAssets(
    val name:String,
    val total:Int,
    val assetIds:List<String>
)

class AccountPlansBigNumberResponse(
    val accounts: List<AccountPlansData>
)

class AccountPlansData(
    val accountId: String,
    val plans: List<PlanTotalAndAssetsExtended>
)

class PlanTotalAndAssetsExtended(
    val name: String,
    val total: Int,
    val assetIds: List<String>,
    val controlTowerAssetIds: List<String>
)

class FilteredAssetIds(
    private val assetIdsToFilter:List<String>,
    private val allAssetIds:List<String>
) {
    fun assetIds() : List<String> {
        return allAssetIds.filter { assetIdFromAll ->
            assetIdsToFilter.any {
                assetIdFromAll == it
            }
        }
    }
}