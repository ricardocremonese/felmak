package br.com.vw.uptime.schedule.infrastructure.filters

import br.com.vw.uptime.schedule.infrastructure.services.cache.RequestContext
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

@Component
class RequestContextInterceptor(
    private val requestContext: RequestContext
) : HandlerInterceptor {
    
    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        val token = request.getHeader("Authorization")
        if (token != null) {
            requestContext.setToken(token)
        }
        return true
    }
    
    override fun afterCompletion(request: HttpServletRequest, response: HttpServletResponse, handler: Any, ex: Exception?) {
        requestContext.clearToken()
    }
}
