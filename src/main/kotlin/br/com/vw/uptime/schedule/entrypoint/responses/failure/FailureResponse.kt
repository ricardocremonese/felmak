package br.com.vw.uptime.schedule.entrypoint.responses.failure

import br.com.vw.uptime.schedule.infrastructure.entities.failure.FailureEntity
import java.time.LocalDateTime

data class FailureResponse(
    val id: Int?,
    val title: String,
    val description: String?,
    val videoUrl: String?,
    val createdBy: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime?
) {
    companion object {
        fun fromEntity(entity: FailureEntity, videoUrl: String? = null): FailureResponse {
            return FailureResponse(
                id = entity.id,
                title = entity.title,
                description = entity.description,
                videoUrl = videoUrl,
                createdBy = entity.createdBy,
                createdAt = entity.createdAt,
                updatedAt = entity.updatedAt
            )
        }
    }
}
