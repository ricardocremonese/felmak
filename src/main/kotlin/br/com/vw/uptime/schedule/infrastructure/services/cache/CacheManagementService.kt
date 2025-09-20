package br.com.vw.uptime.schedule.infrastructure.services.cache

import br.com.vw.uptime.schedule.infrastructure.repositories.assets.AssetsDbRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.AssetsDbRepository.AssetIdAndIdentification
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class CacheManagementService(
    private val cacheService: CacheService,
    private val assetsDbRepository: AssetsDbRepository
) {
    
    private val logger = LoggerFactory.getLogger(CacheManagementService::class.java)

    fun refreshAssetIdAndIdentificationCache(cacheId: String): Boolean {
        return try {
            logger.info("Iniciando atualização do cache de assets")
            
            cacheService.updateAssetIdAndIdentificationInBackground(cacheId) {
                logger.info("Buscando dados de assets do banco")
                val assetData = assetsDbRepository.getAssetIdAndIdentification()
                logger.info("Dados de assets obtidos: ${assetData.size} registros")
                assetData
            }
            
            logger.info("Atualização do cache de assets iniciada com sucesso")
            true
        } catch (e: Exception) {
            logger.error("Erro ao iniciar atualização do cache de assets", e)
            false
        }
    }
    
    fun getAssetIdAndIdentificationCacheStatus(cacheId: String): Map<String, Any> {
        return try {
            val hasCache = cacheService.hasAssetIdAndIdentification(cacheId)
            val cacheData = cacheService.getAssetIdAndIdentification(cacheId)
            
            val status = mutableMapOf<String, Any>(
                "cacheId" to cacheId,
                "hasCache" to hasCache,
                "dataCount" to (cacheData?.size ?: 0),
                "timestamp" to System.currentTimeMillis()
            )
            
            if (hasCache && cacheData != null) {
                status["lastUpdated"] = "Cache disponível"
                status["sampleData"] = cacheData.take(3).map { 
                    mapOf(
                        "id" to it.id,
                        "identification" to it.identification,
                        "accountId" to it.accountId,
                        "accountAssetId" to it.accountAssetId
                    )
                }
            } else {
                status["lastUpdated"] = "Cache não disponível"
            }
            
            status
        } catch (e: Exception) {
            logger.error("Erro ao verificar status do cache para cacheId: $cacheId", e)
            mapOf(
                "cacheId" to cacheId,
                "error" to (e.message ?: "Erro desconhecido"),
                "timestamp" to System.currentTimeMillis()
            )
        }
    }

    fun clearAssetIdAndIdentificationCache(cacheId: String): Boolean {
        return try {
            logger.info("Limpando cache de assets")
            cacheService.setAssetIdAndIdentification(cacheId, emptyList())
            logger.info("Cache de assets limpo com sucesso")
            true
        } catch (e: Exception) {
            logger.error("Erro ao limpar cache de assets", e)
            false
        }
    }

    fun forceRefreshAssetIdAndIdentificationCache(cacheId: String): Boolean {
        return try {
            logger.info("Forçando atualização imediata do cache de assets")
            
            val assetData = assetsDbRepository.getAssetIdAndIdentification()
            logger.info("Dados de assets obtidos: ${assetData.size} registros")
            
            cacheService.setAssetIdAndIdentification(cacheId, assetData)
            
            logger.info("Atualização imediata do cache de assets concluída")
            true
        } catch (e: Exception) {
            logger.error("Erro ao forçar atualização do cache de assets", e)
            false
        }
    }
}
