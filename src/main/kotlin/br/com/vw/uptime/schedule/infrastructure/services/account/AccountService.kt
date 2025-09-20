package br.com.vw.uptime.schedule.infrastructure.services.account

import br.com.vw.uptime.schedule.infrastructure.repositories.account.AccountData
import br.com.vw.uptime.schedule.infrastructure.repositories.account.AccountRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class AccountService(
    private val accountRepository: AccountRepository
) {

    private val log = LoggerFactory.getLogger(AccountService::class.java)

    fun getAccountInfo(accountId: String): AccountData? {
        log.info("Buscando informações da conta: {}", accountId)
        return accountRepository.getAccountInfo(accountId)
    }

    fun getAccountInfoList(accountIds: List<String>): List<AccountData> {
        val uniqueAccountIds = accountIds.distinct()
        log.info("Buscando informações de {} contas", uniqueAccountIds.size)
        return accountRepository.getAccountInfoList(uniqueAccountIds)
    }

    fun getAccountName(accountId: String): String? {
        return getAccountInfo(accountId)?.name
    }
} 