package br.com.vw.uptime.schedule.infrastructure.repositories.account

import br.com.vw.uptime.schedule.core.utils.HttpTreatment
import br.com.vw.uptime.schedule.infrastructure.repositories.token.CachedTokenRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.token.OAuthRioRepository
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Repository

@Repository
class AccountRepository(
    private val okHttpClient: OkHttpClient,
    private val objectMapper: ObjectMapper,
    oAuthRioRepository: OAuthRioRepository
) {

    val cachedTokenRepository = CachedTokenRepository(oAuthRioRepository)

    @Value("\${rio.gateway.service.iam.url:https://api.iam.rio.cloud}")
    lateinit var rioGatewayServiceIam: String

    private val log = LoggerFactory.getLogger(AccountRepository::class.java)

    fun getAccountInfo(accountId: String): AccountData? {
        if (accountId.isBlank()) {
            log.warn("Account ID não pode ser vazio")
            return null
        }

        val httpUrl = rioGatewayServiceIam.toHttpUrl().newBuilder().apply {
            addPathSegment("accounts")
            addPathSegment(accountId)
        }.build()

        val request = Request.Builder()
            .url(httpUrl)
            .header("Authorization", "Bearer ${cachedTokenRepository.getToken()}")
            .get()
            .build()

        try {
            val response = okHttpClient.newCall(request).execute()
            HttpTreatment.throwIfNotSuccessful(response)
            
            val strBody = response.body?.string()
            if (strBody.isNullOrBlank()) {
                log.info("Resposta vazia para account ID: {}", accountId)
                return null
            }
            
            return objectMapper.readValue<AccountData>(strBody)
        } catch (e: Exception) {
            log.error("Erro ao buscar informações da conta {}: {}", accountId, e.message, e)
            return null
        }
    }

    fun getAccountInfoList(accountIds: List<String>): List<AccountData> {
        if (accountIds.isEmpty()) {
            return listOf()
        }

        return accountIds.mapNotNull { accountId ->
            getAccountInfo(accountId)
        }
    }
}

data class AccountData(
    val id: String? = null,
    val name: String? = null,
    val legalAddress: LegalAddress? = null,
    val tenant: String? = null,
    val createdAt: String? = null,
    val finalizationDate: String? = null,
    val registrationChannel: String? = null,
    val taxId: TaxId? = null,
    val lifeCycleState: String? = null,
    val accountType: String? = null,
    val contacts: Contacts? = null
)

data class LegalAddress(
    val line1: String? = null,
    val city: String? = null,
    val postalCode: String? = null,
    val countryCode: String? = null
)

data class TaxId(
    val value: String? = null,
    val taxType: String? = null
)

data class Contacts(
    val general: ContactInfo? = null,
    val billing: ContactInfo? = null
)

data class ContactInfo(
    val email: String? = null
)
