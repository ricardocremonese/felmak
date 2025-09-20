package br.com.vw.uptime.schedule.infrastructure.repositories.assistance

import br.com.vw.uptime.schedule.core.utils.HttpTreatment
import br.com.vw.uptime.schedule.infrastructure.repositories.token.CachedTokenRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.token.OdpOccurrenceTokenRepository
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Repository

@Repository
class OccurrenceDynamicsRepository(
    val okHttpClient: OkHttpClient,
    val objectMapper: ObjectMapper,
    odpOccurrenceTokenRepository: OdpOccurrenceTokenRepository,
) {

    companion object {
        private val log = LoggerFactory.getLogger(OccurrenceDynamicsRepository::class.java)
    }

    private val cachedTokenRepository = CachedTokenRepository(odpOccurrenceTokenRepository)

    @Value("\${odp.dynamics.occurrence.url}")
    lateinit var odpDynamicsOccurrenceUrl:String

    fun save(occurrenceDynamicsSave:OccurrenceDynamicsSaveRequest) : OccurrenceDynamicsSaveResponse {

        val httpUrl = odpDynamicsOccurrenceUrl.toHttpUrl().newBuilder().apply {
            addPathSegment("processamento")
            addPathSegment("incidents")
            addPathSegment("create")
        }.build()

        log.info("Created occurrence dynamics [{}]. Body Request: {}", httpUrl.toString(), occurrenceDynamicsSave)
        val request = Request.Builder()
            .url(httpUrl)
            .header("Authorization", "Bearer ${cachedTokenRepository.getToken()}")
            .header("Content-Type", "application/json")
            .post(objectMapper.writeValueAsString(occurrenceDynamicsSave).toRequestBody())
            .build()
        val response = okHttpClient.newCall(request).execute()
        val body = response.body?.string()
        HttpTreatment.throwIfNotSuccessful(response, body, "Erro ao criar ocorrência no Dynamics")
        return objectMapper.readValue(body, object : TypeReference<OccurrenceDynamicsSaveResponse>(){});
    }
}

data class OccurrenceDynamicsSaveRequest(
    val chassi:String,
    // Código que identifica o tipo do solicitante (e.g. 860010002 = Jurídico).
    val tipoSolicitante:Int,

    // Número do contrato relacionado ao cliente ou serviço
    val numeroContrato:String? = null,

    // Número de veículos envolvidos no incidente
    val qtdVeiculosSolicitados:Int,

    // Tipo de contato (ex: 674830001 = E-mail, Telefone
    val tipoContato:Int,

    // Descrição detalhada do motivo do incidente.
    val descricao:String,

    // Título breve do incidente.
    val titulo:String,

    val assuntoId:String,

    val tipoOcorrencia:Int,
    
    // NOVO: Código do tipo de ocorrência (preenchido automaticamente conforme árvore de assunto)
    val casetypecode:String? = null,
    
    // NOVO: Identificador do veículo no sistema smart_lp_veiculos
    val smart_lp_veiculos:String? = null,
    
    // NOVO: ID do cliente
    val customerid:String? = null,
    
    // NOVO: Campo de localidade (SP, SC, etc.)
    val origem:String? = null
)

data class OccurrenceDynamicsSaveResponse(
    val ticketnumber:String
)