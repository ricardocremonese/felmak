package br.com.vw.uptime.schedule.entrypoint.responses

data class ModelResponse(
    val modelCode: String,
    val segment: String?,
    val description: String?,
    val modelId: String?
) 