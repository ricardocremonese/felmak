package br.com.vw.uptime.schedule.entrypoint.requests.occurrence

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalDateTime

data class JsonOccurrenceImportRequest(
    val occurrences: List<JsonOccurrenceRow>
)

data class OccurrenceImportResponse(
    val totalProcessed: Int,
    val imported: Int,
    val skipped: Int,
    val errors: List<ImportError>,
    val summary: String
)

data class ImportError(
    val row: Int,
    val chassis: String?,
    val error: String
)

data class JsonOccurrenceRow(
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
    val diasEmAbertoEntradaDealer: String?,
    
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