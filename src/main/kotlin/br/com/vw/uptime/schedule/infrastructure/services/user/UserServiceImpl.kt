package br.com.vw.uptime.schedule.infrastructure.services.user

import br.com.vw.uptime.schedule.infrastructure.cache.impl.OccurrencePermissionsCache
import br.com.vw.uptime.schedule.infrastructure.entities.user.UserProfileEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.users.User
import br.com.vw.uptime.schedule.infrastructure.repositories.users.UserProfileRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.users.UsersRepository
import br.com.vw.uptime.schedule.infrastructure.services.occurence.StepTypeOccurrence
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class UsersServiceImpl(private val usersRepository: UsersRepository,
                        private val occurrencePermissionsCache: OccurrencePermissionsCache,
                        private val userProfileRepository: UserProfileRepository,
                       @Value("\${tower-account-id}") private val towerAccountId: String) {

    companion object {
        val log: Logger = LoggerFactory.getLogger(OccurrencePermissionsCache::class.java)
        const val READ = "R"
        const val DEFAULT = "default"
    }

    init {
        occurrencePermissionsCache.putIfAbsent(DEFAULT, buildPermissions())
        occurrencePermissionsCache.putIfAbsent(towerAccountId, buildPermissions("W", *StepTypeOccurrence.entries.toTypedArray()))
    }

    fun getUserById(userId: String): User {
        return usersRepository.getUserById(userId)
    }

    fun getUserProfileByAccountAndGroup(accountId: String, groupId: List<String>): UserProfileEntity? {
        return userProfileRepository.findByAccountAndGroups(accountId, groupId).firstOrNull()
    }

    fun getPermissions(userId: String, accountId: String): Map<String, String>? {
        if(accountId == towerAccountId)
            return occurrencePermissionsCache.getOrDefault(towerAccountId)

        val user = getUserById(userId)
        val profile = getUserProfileByAccountAndGroup(user.accountId, user.groupIds)
        if(profile == null || profile.occurrencePermissions == null) return occurrencePermissionsCache.getOrDefault(DEFAULT)

        return profile.occurrencePermissions
    }

    fun buildPermissions(operation: String = "R", vararg keys: StepTypeOccurrence) : Map<String, String> =
        enumValues<StepTypeOccurrence>().associate { key ->  key.name to (if (!keys.contains(key)) READ else operation) }
}