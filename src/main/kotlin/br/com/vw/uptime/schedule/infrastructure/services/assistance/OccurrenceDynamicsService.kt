package br.com.vw.uptime.schedule.infrastructure.services.assistance

import br.com.vw.uptime.schedule.infrastructure.repositories.assets.UptimeAssetRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.assistance.OccurrenceDynamicsRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.assistance.OccurrenceDynamicsSaveRequest
import br.com.vw.uptime.schedule.infrastructure.repositories.assistance.OccurrenceDynamicsSaveResponse
import br.com.vw.uptime.schedule.infrastructure.services.occurence.OccurrenceType
import org.springframework.stereotype.Service

@Service
class OccurrenceDynamicsService(
    private val occurrenceDynamicsRepository: OccurrenceDynamicsRepository,
    private val uptimeAssetRepository: UptimeAssetRepository
) {

    fun save(
        occurrenceIntegrationSaveRequest:OccurrenceIntegrationSaveRequest
    ): OccurrenceDynamicsSaveResponse {

        return occurrenceDynamicsRepository.save(
            OccurrenceDynamicsSaveRequest(
                chassi = occurrenceIntegrationSaveRequest.chassis,
                tipoSolicitante = RequestedTypeEnum.OTHERS.id,
                tipoContato = ContactType.CONTROL_TOWER.id,
                assuntoId = SubjectsEnum.ASSISTANCE_SUBJECT.id,
                numeroContrato = "",
                qtdVeiculosSolicitados = 1,
                titulo = "Uptime ",
                descricao = "Occurence uptime id: ${occurrenceIntegrationSaveRequest.occurrenceUuid}",
                tipoOcorrencia = selectOccurrenceTypeDynamics(
                    occurrenceIntegrationSaveRequest.occurrenceType
                ),
                paisSolicitante = occurrenceIntegrationSaveRequest.country.id,
                origem = OriginEnum.PHONE_NUMBER.code
            )
        )
    }

    fun validateChassis(chassis: String): ChassisValidationResponse {
        return try {
            val uptimeAsset = uptimeAssetRepository.findByChassis(chassis)
            
            if (uptimeAsset != null && uptimeAsset.odp != null) {
                ChassisValidationResponse(
                    exists = true,
                    message = "Chassis válido - encontrado no sistema Uptime com dados ODP"
                )
            } else {
                ChassisValidationResponse(
                    exists = false,
                    message = if (uptimeAsset == null) {
                        "Chassis não encontrado no sistema Uptime"
                    } else {
                        "Chassis encontrado mas sem dados ODP"
                    }
                )
            }
        } catch (e: Exception) {
            ChassisValidationResponse(
                exists = false,
                message = "Erro ao validar chassis: ${e.message}"
            )
        }
    }

    private fun selectOccurrenceTypeDynamics(occurrenceType: OccurrenceType): Int {
        return when(occurrenceType) {
            OccurrenceType.ASSISTANCE -> OccurrenceTypeDynamicsEnum.ASSISTANCE.id
            OccurrenceType.WINCH -> OccurrenceTypeDynamicsEnum.ASSISTANCE.id
            else -> throw IllegalArgumentException("Must be ASSISTANCE ou WINCH to save occurrence on Dynamics system")
        }
    }

}

enum class SubjectsEnum(
    val id:String,
) {
    // 09. Roda (retentor /cubo / rolamento)
    WHEEL("23d5e490-932f-ed11-9db1-000d3a889859"),

    // ONE - Negociação Especial
    SPECIAL_BUSINESS("6e037ce1-1162-ee11-8df0-000d3a889c6f"),

    // ONE - Bônus MP – Pagamentos 80c71707-1262-ee11-8df0-000d3a889c6f
    PAYMENT_BONUS("80c71707-1262-ee11-8df0-000d3a889c6f"),

    // ONE - Bônus Usado 1efe4313-1262-ee11-8df0-000d3a889c6f
    USED_BONUS("1efe4313-1262-ee11-8df0-000d3a889c6f"),

    // ONE - Bônus MP – Pagamentos 80c71707-1262-ee11-8df0-000d3a889c6f
    CIRCULAR_BONUS("80c71707-1262-ee11-8df0-000d3a889c6f"),

    // ONE - Webflow 380b25ab-1362-ee11-8df0-000d3a889c6f
    ONE_WEBFLOW("380b25ab-1362-ee11-8df0-000d3a889c6f"),

    // ONE - Intenção de Compras 93d689de-1362-ee11-8df0-000d3a889c6f
    ONE_BUY_INTENTION("93d689de-1362-ee11-8df0-000d3a889c6f"),

    // Portal dos Dealers b649e6e4-1362-ee11-8df0-000d3a889c6f
    DEALERS_PORTAL("b649e6e4-1362-ee11-8df0-000d3a889c6f"),

    // ONE - Acesso ao Sistema - Outros Módulos 44271f04-1762-ee11-8df0-000d3a889c6f
    OTHER_MODULES("44271f04-1762-ee11-8df0-000d3a889c6f"),

    // ONE - Cadastro de Cliente 1a12b4fe-1bac-ee11-a569-000d3a889c6f
    CUSTOMER_REGISTER("1a12b4fe-1bac-ee11-a569-000d3a889c6f"),

    ASSISTANCE_SUBJECT("edc2c006-b738-e611-80e8-00155d1eaf18")
}

// Inteiro Sim Código que identifica o tipo do solicitante
enum class RequestedTypeEnum(
    val id:Int
) {

    // DN
    DN(860010000),

    // DN não identificado
    DN_NOT_IDENTIFIED(860010001),

    // Outros
    OTHERS(860010002),
}

enum class ContactType(
    val id:Int
) {
    DN(674830000),
    CUSTOMER(674830001),
    INTERN(674830002),
    CONTROL_TOWER(674830003),
}

enum class OccurrenceTypeDynamicsEnum(
    val id: Int
) {
    ASSISTANCE(1),
    COMPLAINT(2),
    INFORMATION(3),
    //P&A
    PEA(860010000),
}

enum class CountryOccurrenceDynamics(
    val id:Int
) {
    ARGENTINA(674830000),
    BRASIL(674830001),
    CHILE(674830002),
    COLOMBIA(674830003),
    URUGUAI(674830004);

    companion object {
        fun valueOfOrDefault(value:String, defaultEnum:CountryOccurrenceDynamics): CountryOccurrenceDynamics {
            return CountryOccurrenceDynamics.entries.firstOrNull {
                it.name == value.trim()
            } ?: defaultEnum
        }
    }
}

data class OccurrenceIntegrationSaveRequest(
    val chassis:String,
    val country: CountryOccurrenceDynamics,
    val occurrenceType:OccurrenceType,
    val occurrenceUuid:String
)

data class ChassisValidationResponse(
    val exists: Boolean,
    val message: String? = null
)

enum class OriginEnum(
    val code:Int
) {
    PHONE_NUMBER(1),
    EMAIL(2)
}