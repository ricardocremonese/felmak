package br.com.vw.uptime.schedule.infrastructure.services.cache

import br.com.vw.uptime.schedule.core.configs.CacheConfig
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.stereotype.Component

@Component
class CacheInitializer(
    private val cacheManagementService: CacheManagementService,
    private val cacheConfig: CacheConfig
) : ApplicationRunner {

    private val logger = LoggerFactory.getLogger(CacheInitializer::class.java)

    @Value("\${tower-account-id}")
    private lateinit var towerAccountId: String

    override fun run(args: ApplicationArguments?) {
        if (!cacheConfig.autoLoadOnStartup) {
            logger.info("⏭️ Carregamento automático do cache desabilitado (cache.auto-load-on-startup=false)")
            return
        }
        
        logger.info("Iniciando carregamento do cache de assets...")
        
        try {
            logger.info("Carregando dados de assets no cache para towerAccountId: $towerAccountId")
            
            val startTime = System.currentTimeMillis()
            val success = cacheManagementService.forceRefreshAssetIdAndIdentificationCache(towerAccountId)
            val endTime = System.currentTimeMillis()
            val duration = endTime - startTime
            
            if (success) {
                logger.info("Cache de assets carregado com sucesso em ${duration}ms!")
                
                val status = cacheManagementService.getAssetIdAndIdentificationCacheStatus(towerAccountId)
                val dataCount = status["dataCount"] as? Int ?: 0
                logger.info("Cache contém $dataCount registros de assets")
                
                if (dataCount > 0) {
                    logger.info("Cache inicializado e pronto para uso!")
                    
                    if (cacheConfig.enableDetailedLogs) {
                        logger.info("🔍 Detalhes do cache: $status")
                    }
                } else {
                    logger.warn("Cache foi inicializado mas não contém dados")
                }
            } else {
                logger.error("Falha ao carregar cache de assets")
            }
            
        } catch (e: Exception) {
            logger.error("Erro ao inicializar cache de assets: ${e.message}", e)
            logger.info("A aplicação continuará funcionando, cache será carregado na primeira requisição")
        }
    }
}
