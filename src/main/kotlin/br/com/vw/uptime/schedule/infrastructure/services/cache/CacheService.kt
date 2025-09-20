package br.com.vw.uptime.schedule.infrastructure.services.cache

import br.com.vw.uptime.schedule.infrastructure.repositories.assets.AssetsDbRepository.AssetIdAndIdentification
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.SubscriptionData
import br.com.vw.uptime.schedule.infrastructure.services.cache.RequestContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.concurrent.ConcurrentHashMap

@Service
class CacheService(
    private val requestContext: RequestContext
) {
    
    private val assetCache = ConcurrentHashMap<String, CachedData<List<AssetIdAndIdentification>>>()
    private val subscriptionCache = ConcurrentHashMap<String, CachedData<List<SubscriptionData>>>()
    private val coroutineScope = CoroutineScope(Dispatchers.IO)
    
    data class CachedData<T>(
        val data: T,
        val lastUpdated: LocalDateTime,
        val isUpdating: Boolean = false
    ) {
        fun isExpired(): Boolean {
            val now = LocalDateTime.now()
            val hoursSinceUpdate = java.time.Duration.between(lastUpdated, now).toHours()
            return hoursSinceUpdate >= 2 // expires in 2 hours
        }
    }
    
    fun getAssetIdAndIdentification(cacheId: String): List<AssetIdAndIdentification>? {
        return assetCache[cacheId]?.data
    }
    
    fun getSubscriptions(): List<SubscriptionData>? {
        return subscriptionCache["all"]?.data
    }
    
    fun setAssetIdAndIdentification(cacheId: String, data: List<AssetIdAndIdentification>) {
        val fleetAssets = data.filter { it.accountId != cacheId }

        val updatedData = data.map { asset ->
            if (asset.accountId == cacheId) {
                val matchingFleetAsset = fleetAssets.firstOrNull { it.identification == asset.identification }
                if (matchingFleetAsset != null) {
                    asset.copy(accountAssetId = matchingFleetAsset.id)
                } else {
                    asset
                }
            } else {
                asset
            }
        }

        assetCache[cacheId] = CachedData(
            data = updatedData,
            lastUpdated = LocalDateTime.now()
        )
    }
    
    fun setSubscriptions(data: List<SubscriptionData>) {
        subscriptionCache["all"] = CachedData(
            data = data,
            lastUpdated = LocalDateTime.now()
        )
    }
    
    fun updateAssetIdAndIdentificationInBackground(
        cacheId: String,
        fetchFunction: () -> List<AssetIdAndIdentification>
    ) {
        val currentCache = assetCache[cacheId]
        
        if (currentCache?.isUpdating == true) {
            return
        }
        
        if (currentCache != null && !currentCache.isExpired()) {
            return
        }
        
        assetCache[cacheId] = currentCache?.copy(isUpdating = true) 
            ?: CachedData(emptyList(), LocalDateTime.now(), true)
        
        coroutineScope.launch {
            try {
                val newData = fetchFunction()
                setAssetIdAndIdentification(cacheId, newData)
            } catch (e: Exception) {
                println("Error updating cache of assets: ${e.message}")
            }
        }
    }
    
    fun updateSubscriptionsInBackground(fetchFunction: (String) -> List<SubscriptionData>) {
        val currentCache = subscriptionCache["all"]
        
        if (currentCache?.isUpdating == true) {
            return
        }
        
        if (currentCache != null && !currentCache.isExpired()) {
            return
        }
        
        subscriptionCache["all"] = currentCache?.copy(isUpdating = true) 
            ?: CachedData(emptyList(), LocalDateTime.now(), true)
        
        coroutineScope.launch {
            try {
                val token = requestContext.getToken()
                if (token != null) {
                    val newData = fetchFunction(token)
                    setSubscriptions(newData)
                }
            } catch (e: Exception) {
                println("Erro ao atualizar cache de subscriptions: ${e.message}")
            }
        }
    }
    
    fun hasAssetIdAndIdentification(cacheId: String): Boolean {
        return assetCache.containsKey(cacheId)
    }
    
    fun hasSubscriptions(): Boolean {
        return subscriptionCache.containsKey("all")
    }
}
