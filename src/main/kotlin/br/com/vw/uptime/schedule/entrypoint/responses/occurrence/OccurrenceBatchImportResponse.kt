package br.com.vw.uptime.schedule.entrypoint.responses.occurrence

data class OccurrenceBatchImportResponse(
    val totalProcessed: Int,
    val created: Int,
    val updated: Int,
    val errors: List<ImportError>,
    val summary: String
)

data class ImportError(
    val rowNumber: Int,
    val chassis: String?,
    val message: String
) 