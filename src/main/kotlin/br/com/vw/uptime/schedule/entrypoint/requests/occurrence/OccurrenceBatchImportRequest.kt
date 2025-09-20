package br.com.vw.uptime.schedule.entrypoint.requests.occurrence

import com.fasterxml.jackson.annotation.JsonProperty
import br.com.vw.uptime.schedule.infrastructure.services.occurence.OccurrenceAddRequest
import br.com.vw.uptime.schedule.infrastructure.services.occurence.OccurrenceVehicleAddRequest
import br.com.vw.uptime.schedule.infrastructure.services.occurence.OccurrenceDriverAddRequest
import br.com.vw.uptime.schedule.infrastructure.services.occurence.OccurrenceDealershipAddRequest
import br.com.vw.uptime.schedule.entrypoint.requests.occurrence.OccurrenceVehicleUpdateRequest
import br.com.vw.uptime.schedule.entrypoint.requests.occurrence.OccurrenceDriverUpdateRequest
import br.com.vw.uptime.schedule.entrypoint.requests.occurrence.OccurrenceDealershipUpdateRequest
import br.com.vw.uptime.schedule.entrypoint.requests.occurrence.OccurrencePartOrderUpdateRequest
import br.com.vw.uptime.schedule.entrypoint.requests.occurrence.OccurrenceUpdateRequest
import br.com.vw.uptime.schedule.infrastructure.services.occurence.OccurrenceType

data class OccurrenceBatchImportRequest(
    val occurrences: List<OccurrenceImportData>
)

data class OccurrenceImportData(
    @JsonProperty("ID")
    val id: Int?,
    
    @JsonProperty("Número da Ocorrência")
    val numeroOcorrencia: String?,
    
    @JsonProperty("Placa / Chassi")
    val placaChassi: String?,
    
    @JsonProperty("Placa")
    val placa: String?,
    
    @JsonProperty("Assunto")
    val assunto: String?,
    
    @JsonProperty("DN")
    val dn: String?,
    
    @JsonProperty("Regional")
    val regional: Int?,
    
    @JsonProperty("Código DN")
    val codigoDn: Int?,
    
    @JsonProperty("Cliente")
    val cliente: String?,
    
    @JsonProperty("CPV")
    val cpv: String?,
    
    @JsonProperty("Criado")
    val criado: String?,
    
    @JsonProperty("Tempo em Cerca")
    val tempoEmCerca: String?,
    
    @JsonProperty("Data da resolução")
    val dataResolucao: String?,
    
    @JsonProperty("Data de entrada no Dealer")
    val dataEntradaDealer: String?,
    
    @JsonProperty("Data do Pedido da Peça")
    val dataPedidoPeca: String?,
    
    @JsonProperty("Data da Previsão da Peça")
    val dataPrevisaoPeca: String?,
    
    @JsonProperty("Data de entrega da peça")
    val dataEntregaPeca: String?,
    
    @JsonProperty("Data do TAS")
    val dataTas: String?,
    
    @JsonProperty("Data Inicio Montagem")
    val dataInicioMontagem: String?,
    
    @JsonProperty("Dias Em Aberto Entrada Dealer")
    val diasEmAberto: String?,
    
    @JsonProperty("Etapa Kanban")
    val etapaKanban: String?,
    
    @JsonProperty("Legislação")
    val legislacao: String?,
    
    @JsonProperty("Modelo Veículo")
    val modeloVeiculo: String?,
    
    @JsonProperty("Número TAS")
    val numeroTas: String?,
    
    @JsonProperty("Observações")
    val observacoes: String?,
    
    @JsonProperty("KM")
    val km: String?,
    
    @JsonProperty("Previsão de Liberação")
    val previsaoLiberacao: String?,
    
    @JsonProperty("Status de Previsão de liberação")
    val statusPrevisaoLiberacao: String?,
    
    @JsonProperty("Status P&A")
    val statusPa: String?,
    
    @JsonProperty("Número do pedido de Peças")
    val numeroPedidoPecas: String?,
    
    @JsonProperty("Status atual")
    val statusAtual: String?,
    
    @JsonProperty("Status Pedido")
    val statusPedido: String?,
    
    @JsonProperty("Tipo de contato")
    val tipoContato: String?,
    
    @JsonProperty("Modo de Falha")
    val modoFalha: String?,
    
    @JsonProperty("Tipo de Falha")
    val tipoFalha: String?,
    
    @JsonProperty("Tipo de Ocorrência")
    val tipoOcorrencia: String?,
    
    @JsonProperty("Tipo de pedido")
    val tipoPedido: String?
)

data class OccurrenceImportDataBatchRequest(
    val occurrences: List<OccurrenceImportData>
)

fun OccurrenceImportData.toOccurrenceAddRequest(): OccurrenceAddRequest {
    return OccurrenceAddRequest().apply {
        // Vehicle
        vehicle = OccurrenceVehicleAddRequest().apply {
            chassis = this@toOccurrenceAddRequest.placaChassi?.trim()?.take(17)
            licencePlace = this@toOccurrenceAddRequest.placa?.trim()?.take(7)
            model = this@toOccurrenceAddRequest.modeloVeiculo?.trim()?.take(50)
            legislation = this@toOccurrenceAddRequest.legislacao?.trim()?.take(10)
            odometer = this@toOccurrenceAddRequest.km?.toIntOrNull()
        }
        
        // Driver
        driver = OccurrenceDriverAddRequest().apply {
            name = this@toOccurrenceAddRequest.cpv?.trim()?.take(50)
        }
        
        // Dealership
        dealership = OccurrenceDealershipAddRequest().apply {
            dn = this@toOccurrenceAddRequest.codigoDn?.toString()?.trim()?.take(10)
            regional = this@toOccurrenceAddRequest.regional?.toString()?.trim()?.take(10)
        }
        
        // Basic occurrence data
        observation = this@toOccurrenceAddRequest.observacoes?.trim()?.take(600)
        criticality = determineCriticality(this@toOccurrenceAddRequest.modoFalha)
        occurrenceType = mapOccurrenceType(this@toOccurrenceAddRequest.tipoOcorrencia)
        status = this@toOccurrenceAddRequest.statusAtual?.trim()?.take(50)
        createdBy = this@toOccurrenceAddRequest.tipoContato?.trim()?.take(50)
    }
}

private fun determineCriticality(modoFalha: String?): Int {
    return when (modoFalha?.trim()) {
        "1.0 MOTOR" -> 3
        "5 EIXO TRASEIRO" -> 2
        // 40.2SISTEMA DE DIREÇÃO" -> 2
        else -> 1
    }
}

private fun mapOccurrenceType(tipoOcorrencia: String?): OccurrenceType {
    return when (tipoOcorrencia?.trim()) {
        "Protege" -> OccurrenceType.ASSISTANCE
        else -> OccurrenceType.ASSISTANCE
    }
}

fun OccurrenceImportData.toOccurrenceUpdateRequest(): OccurrenceUpdateRequest {
    return OccurrenceUpdateRequest().apply {
        // Dados principais
        osNumber = this@toOccurrenceUpdateRequest.numeroOcorrencia?.trim()?.take(255)
        observation = this@toOccurrenceUpdateRequest.observacoes?.trim()?.take(600)
        criticality = determineCriticality(this@toOccurrenceUpdateRequest.modoFalha)
        occurrenceType = mapOccurrenceType(this@toOccurrenceUpdateRequest.tipoOcorrencia)
        status = this@toOccurrenceUpdateRequest.statusAtual?.trim()?.take(50)
        customer = this@toOccurrenceUpdateRequest.cliente?.trim()?.take(255)
        tasNumber = this@toOccurrenceUpdateRequest.numeroTas?.trim()?.take(255)
        tasStatus = this@toOccurrenceUpdateRequest.statusPedido?.trim()?.take(255)
        source = this@toOccurrenceUpdateRequest.tipoContato?.trim()?.take(255)
        country = "Brasil"
        mainOccurrence = "-"
        hasLink = false
        mechanicLocation = "-"
        towTruckLocation = "-"

        // Datas
        osDtOpenAt = parseDateTime(this@toOccurrenceUpdateRequest.criado)
        // estimateTimeRepair = this@toOccurrenceUpdateRequest.previsaoLiberacao
        
        // Vehicle
        vehicle = OccurrenceVehicleUpdateRequest().apply {
            chassis = this@toOccurrenceUpdateRequest.placaChassi?.trim()?.take(17)
            licensePlate = this@toOccurrenceUpdateRequest.placa?.trim()?.take(7)
            model = this@toOccurrenceUpdateRequest.modeloVeiculo?.trim()?.take(50)
            emissionStandard = this@toOccurrenceUpdateRequest.legislacao?.trim()?.take(10)
            odometer = this@toOccurrenceUpdateRequest.km?.toIntOrNull()
            vehicleType = "-"
            payloadType = "-"
            maximumPayload = 0
            criticalPayload = false
            stopped = false
            name = "-"
            vehicleYear = 0
        }
        // Driver
        driver = OccurrenceDriverUpdateRequest().apply {
            name = this@toOccurrenceUpdateRequest.cpv?.trim()?.take(255)
            checkInDriver = "-"
        }
        // Dealership
        dealership = OccurrenceDealershipUpdateRequest().apply {
            dn = this@toOccurrenceUpdateRequest.codigoDn?.toString()?.trim()?.take(255)
            regional = this@toOccurrenceUpdateRequest.regional?.toString()?.trim()?.take(255)
        }
        // Parts order
        if (!this@toOccurrenceUpdateRequest.numeroPedidoPecas.isNullOrBlank()) {
            partsOrder = OccurrencePartOrderUpdateRequest().apply {
                orderNumber = this@toOccurrenceUpdateRequest.numeroPedidoPecas?.trim()?.take(255)
                status = this@toOccurrenceUpdateRequest.statusPa?.trim()?.take(255)
                dtOrder = parseDateTime(this@toOccurrenceUpdateRequest.dataPedidoPeca)
                dtEstimate = parseDateTime(this@toOccurrenceUpdateRequest.dataPrevisaoPeca)
                dtDeliveryEstimate = parseDateTime(this@toOccurrenceUpdateRequest.dataEntregaPeca)
            }
        }
    }
}

private fun parseDateTime(dateTimeStr: String?): java.time.LocalDateTime? {
    if (dateTimeStr.isNullOrBlank()) return null
    return try {
        val formatter = java.time.format.DateTimeFormatter.ofPattern("M-d-yyyy h:mm:ss a", java.util.Locale.ENGLISH)
        java.time.LocalDateTime.parse(dateTimeStr, formatter)
    } catch (e: Exception) {
        try {
            val dateOnlyFormatter = java.time.format.DateTimeFormatter.ofPattern("M-d-yyyy", java.util.Locale.ENGLISH)
            java.time.LocalDate.parse(dateTimeStr, dateOnlyFormatter).atStartOfDay()
        } catch (e2: Exception) {
            null
        }
    }
} 