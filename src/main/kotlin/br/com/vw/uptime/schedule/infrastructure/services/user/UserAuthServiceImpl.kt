package br.com.vw.uptime.schedule.infrastructure.services.user

import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Service


@Service
class UserAuthServiceImpl(
    val httpServletRequest: HttpServletRequest
) {

    fun usr() : UserAuthenticate {
        return httpServletRequest.getAttribute("authenticate") as UserAuthenticate
    }

}