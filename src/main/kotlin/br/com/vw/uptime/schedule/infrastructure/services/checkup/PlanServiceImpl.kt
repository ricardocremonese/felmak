package br.com.vw.uptime.schedule.infrastructure.services.checkup

import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.AssetPeriodData
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.SubscriptionData
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.PlanRepository
import org.springframework.stereotype.Service

@Service
class PlanServiceImpl (
    private val planRepository: PlanRepository
){

    fun getPlansAndAssets() : List<AssetPeriodData> {
        val assetsAndPlans = planRepository.getAssetsAndPlans()
        return assetsAndPlans
    }

    fun getAllActivePlans() : List<PlanNumbers> {
        val productDataList = planRepository.getActiveProducts()
            .filter {
                it.isActive && it.isBundle
            }
        return productDataList.map {
            with(PlanNumbers()) {
                this.productId = it.sku
                this.productName = it.name
                this
            }
        }
    }

    fun getPlansByAssetId(assetId:String, assetPeriodDataList:List<AssetPeriodData>) : List<PlanMaintenance> {
        val planMaintenanceList = arrayListOf<PlanMaintenance>()
        for(product in assetPeriodDataList) {
            for(periods in product.periods) {
                if(periods.assets.any { it.assetId == assetId }) {
                    planMaintenanceList.add(
                        with(PlanMaintenance()) {
                            this.productId = product.sku
                            this.productName = product.productName
                            this
                        }
                    )
                    break
                }
            }
        }
        return planMaintenanceList
    }

    fun getSubscriptions() : List<SubscriptionData> {
        val allSubscriptions = planRepository.getSubscriptions()
        return allSubscriptions
    }
    
    fun getSubscriptions(token: String) : List<SubscriptionData> {
        val allSubscriptions = planRepository.getAllSubscriptionsPaginated(token)
        return allSubscriptions
    }
}

class PlanMaintenance {
    lateinit var productId:String
    lateinit var productName:String
}

class PlanNumbers {

    var amount:Long = 0
    lateinit var productId:String
    lateinit var productName:String

}