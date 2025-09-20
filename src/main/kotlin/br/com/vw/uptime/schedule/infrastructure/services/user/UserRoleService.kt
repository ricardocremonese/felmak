package br.com.vw.uptime.schedule.infrastructure.services.user

import br.com.vw.uptime.schedule.core.enums.PersonaType
import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.enums.schedule.InviterType
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class UserRoleService(
    private val userServiceImpl: UsersServiceImpl,) {

    @Value("\${group-user-consultant}")
    lateinit var consultantGroup:String

    @Value("\${tower-account-id}")
    lateinit var towerAccountId:String

    @Value("\${fleet-admin-group-id}")
    lateinit var fleetAdminGroupId:String

    @Value("\${fleet-user-group-id}")
    lateinit var fleetUserGroupId:String

    @Value("\${uptime-presentation-group-id}")
    lateinit var uptimePresentationGroupId:String

    // TODO For better performance, the role could be cached, however the key must be well designed to not affect users with several groupIds
    fun getRoleByUserId(userAuth: UserAuthenticate) : UserRole {

        if(towerAccountId != userAuth.accountId) {
            val user = userServiceImpl.getUserById(userId = userAuth.userId)
            val role = roleByGroupIds(user.accountId, user.groupIds) ?: InviterType.MANAGER.name
            return UserRole(role)
        }

        val user = userServiceImpl.getUserById(userId = userAuth.userId)
        val role = roleByGroupIds(user.accountId, user.groupIds) ?: throw BusinessException(ErrorCode.NO_ROLE_FOUND.toResponse())
        return UserRole(role)
    }


    // TODO This fragment of code needs to reviewed because it always the take first groupId as the correct one, it works right now but we don't know for how long
    private fun roleByGroupIds(accountId: String, groupIds:List<String>): String? {
        for(thisGroup in groupIds)  {
            if(thisGroup == consultantGroup) {
                return InviterType.CONSULTANT.name
            }
            if(thisGroup in listOf(fleetUserGroupId, fleetAdminGroupId, uptimePresentationGroupId)) {
                return InviterType.TOWER.name
            }
        }
        return userServiceImpl.getUserProfileByAccountAndGroup(accountId, groupIds)?.role
    }

    companion object {
        fun getPartnerId(persona: PersonaType, authenticatedUser: UserAuthenticate): String? {
            if(persona == PersonaType.PARTNERSHIP) {
                return authenticatedUser.accountId
            }
            return null
        }

        fun getAccountByPersona(persona: PersonaType, authenticatedUser: UserAuthenticate, towerAccountId:String): String? {
            return if(authenticatedUser.accountId == towerAccountId && persona == PersonaType.TOWER || persona == PersonaType.CONSULTANT || persona == PersonaType.PARTNERSHIP) {
                null
            } else {
                authenticatedUser.accountId
            }
        }
    }
}

data class UserRole(
    val role:String
)