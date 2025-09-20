package br.com.vw.uptime.schedule.entrypoint.responses.occurrence

data class OccurrencePaginatedResponse(
    val occurrences: List<OccurrenceResponse>,
    val totalElements: Long,
    val totalPages: Int,
    val currentPage: Int,
    val pageSize: Int,
    val totalMinutes: Long,
    val totalWithSteps: Long
)
