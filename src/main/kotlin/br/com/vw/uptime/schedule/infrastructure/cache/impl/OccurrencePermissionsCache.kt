package br.com.vw.uptime.schedule.infrastructure.cache.impl

import br.com.vw.uptime.schedule.core.configs.properties.OccurrencePermissions
import br.com.vw.uptime.schedule.infrastructure.cache.CacheComponent
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

@Component
class OccurrencePermissionsCache(occurrencePermissions: OccurrencePermissions) : CacheComponent<String, Map<String, String>>() {
    companion object {
        val log: Logger = LoggerFactory.getLogger(OccurrencePermissionsCache::class.java)
        const val SUFFIX = "occurrence"
    }

    fun getOrDefault(key:String) : Map<String, String>? = get("$SUFFIX:$key")

    fun putIfAbsent(key: String, value: Map<String, String>) = put("$SUFFIX:$key", value)
}