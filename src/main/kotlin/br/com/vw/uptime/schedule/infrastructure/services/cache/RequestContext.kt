package br.com.vw.uptime.schedule.infrastructure.services.cache

import org.springframework.stereotype.Component
import java.util.concurrent.ConcurrentHashMap

@Component
class RequestContext {
    
    private val contextMap = ConcurrentHashMap<String, String>()
    
    fun setToken(token: String) {
        val threadId = Thread.currentThread().id.toString()
        contextMap[threadId] = token
    }
    
    fun getToken(): String? {
        val threadId = Thread.currentThread().id.toString()
        return contextMap[threadId]
    }
    
    fun clearToken() {
        val threadId = Thread.currentThread().id.toString()
        contextMap.remove(threadId)
    }
}
