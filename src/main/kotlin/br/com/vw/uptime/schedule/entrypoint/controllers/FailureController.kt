package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.entrypoint.responses.common.SuccessResponse
import br.com.vw.uptime.schedule.entrypoint.responses.failure.FailureResponse
import br.com.vw.uptime.schedule.entrypoint.responses.failure.VideoUrlResponse
import br.com.vw.uptime.schedule.infrastructure.entities.failure.FailureEntity
import br.com.vw.uptime.schedule.infrastructure.services.failure.FailureService
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/v1/failures")
class FailureController(
    private val failureService: FailureService
) {
    private val logger = LoggerFactory.getLogger(FailureController::class.java)
    private val idLessThanZeroErrorMessage = "ID deve ser maior que 0"

    @GetMapping
    fun getAllFailures(
        @RequestParam(defaultValue = "0") page: Int = 0,
        @RequestParam(defaultValue = "10") size: Int = 10,
        @RequestParam(defaultValue = "id") sortBy: String = "id",
        @RequestParam(defaultValue = "desc") sortDirection: String = "desc",
        @RequestParam(required = false) title: String? = null
    ): ResponseEntity<Page<FailureResponse>> {
        return try {
            if (page < 0) {
                throw IllegalArgumentException("Página deve ser maior ou igual a 0")
            }
            
            val sort = if (sortDirection.equals("asc", ignoreCase = true)) {
                Sort.by(sortBy).ascending()
            } else {
                Sort.by(sortBy).descending()
            }
            
            val pageable: Pageable = PageRequest.of(page, size, sort)
            
            val failures = if (title != null && title.isNotBlank()) {
                failureService.findAllByTitle(title, pageable)
            } else {
                failureService.findAll(pageable)
            }
            
            val failureResponses = failures.map { entity ->
                try {
                    val videoUrl = failureService.getVideoUrl(entity.id!!)
                    FailureResponse.fromEntity(entity, videoUrl)
                } catch (e: Exception) {
                    logger.warn("Erro ao obter URL do vídeo para falha ${entity.id}: ${e.message}")
                    FailureResponse.fromEntity(entity, null)
                }
            }
            
            ResponseEntity.ok(failureResponses)
        } catch (e: Exception) {
            logger.error("Erro ao listar falhas: ${e.message}", e)
            throw e
        }
    }

    @GetMapping("/{id}")
    fun getFailureById(@PathVariable id: Int): ResponseEntity<FailureResponse> {
        return try {
            if (id <= 0) {
                throw IllegalArgumentException(idLessThanZeroErrorMessage)
            }
            
            val failure = failureService.findById(id)
            if (failure != null) {
                try {
                    val videoUrl = failureService.getVideoUrl(id)
                    val response = FailureResponse.fromEntity(failure, videoUrl)
                    ResponseEntity.ok(response)
                } catch (e: Exception) {
                    logger.warn("Erro ao obter URL do vídeo para falha $id: ${e.message}")
                    val response = FailureResponse.fromEntity(failure, null)
                    ResponseEntity.ok(response)
                }
            } else {
                throw IllegalArgumentException("Falha não encontrada com ID: $id")
            }
        } catch (e: Exception) {
            logger.error("Erro ao buscar falha com ID $id: ${e.message}", e)
            throw e
        }
    }

    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun createFailure(
        @RequestParam("title") title: String,
        @RequestParam("description", required = false) description: String?,
        @RequestParam("video", required = false) video: MultipartFile?
    ): ResponseEntity<FailureResponse> {
        return try {
            if (title.isBlank()) {
                throw IllegalArgumentException("Título é obrigatório")
            }
            
            video?.let { file ->
                if (file.isEmpty) {
                    throw IllegalArgumentException("Arquivo de vídeo não pode estar vazio")
                }
                
                val maxSize = 100 * 1024 * 1024 // 100MB
                if (file.size > maxSize) {
                    throw IllegalArgumentException("Arquivo de vídeo muito grande. Máximo 100MB")
                }
                
                val allowedTypes = listOf("video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv")
                if (!allowedTypes.contains(file.contentType)) {
                    throw IllegalArgumentException("Tipo de arquivo não suportado. Use: MP4, AVI, MOV, WMV, FLV")
                }
            }
            
            val failure = FailureEntity(
                title = title.trim(),
                description = description?.trim()
            )
            
            val createdFailure = failureService.create(failure, video)
            
            try {
                val videoUrl = failureService.getVideoUrl(createdFailure.id!!)
                val response = FailureResponse.fromEntity(createdFailure, videoUrl)
                ResponseEntity.ok(response)
            } catch (e: Exception) {
                logger.warn("Erro ao obter URL do vídeo para falha criada ${createdFailure.id}: ${e.message}")
                val response = FailureResponse.fromEntity(createdFailure, null)
                ResponseEntity.ok(response)
            }
        } catch (e: Exception) {
            logger.error("Erro ao criar falha: ${e.message}", e)
            throw e
        }
    }

    @PutMapping("/{id}", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun updateFailure(
        @PathVariable id: Int,
        @RequestParam("title") title: String,
        @RequestParam("description", required = false) description: String?,
        @RequestParam("video", required = false) video: MultipartFile?
    ): ResponseEntity<FailureResponse> {
        return try {
            if (id <= 0) {
                throw IllegalArgumentException(idLessThanZeroErrorMessage)
            }
            
            if (title.isBlank()) {
                throw IllegalArgumentException("Título é obrigatório")
            }
            
            video?.let { file ->
                if (file.isEmpty) {
                    throw IllegalArgumentException("Arquivo de vídeo não pode estar vazio")
                }
                
                val maxSize = 100 * 1024 * 1024 // 100MB
                if (file.size > maxSize) {
                    throw IllegalArgumentException("Arquivo de vídeo muito grande. Máximo 100MB")
                }
                
                val allowedTypes = listOf("video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv")
                if (!allowedTypes.contains(file.contentType)) {
                    throw IllegalArgumentException("Tipo de arquivo não suportado. Use: MP4, AVI, MOV, WMV, FLV")
                }
            }
            
            val failure = FailureEntity(
                title = title.trim(),
                description = description?.trim()
            )
            
            val updatedFailure = failureService.update(id, failure, video)
            if (updatedFailure != null) {
                try {
                    val videoUrl = failureService.getVideoUrl(id)
                    val response = FailureResponse.fromEntity(updatedFailure, videoUrl)
                    ResponseEntity.ok(response)
                } catch (e: Exception) {
                    logger.warn("Erro ao obter URL do vídeo para falha atualizada $id: ${e.message}")
                    val response = FailureResponse.fromEntity(updatedFailure, null)
                    ResponseEntity.ok(response)
                }
            } else {
                throw IllegalArgumentException("Falha não encontrada com ID: $id")
            }
        } catch (e: Exception) {
            logger.error("Erro ao atualizar falha com ID $id: ${e.message}", e)
            throw e
        }
    }

    @DeleteMapping("/{id}")
    fun deleteFailure(@PathVariable id: Int): ResponseEntity<SuccessResponse> {
        return try {
            if (id <= 0) {
                throw IllegalArgumentException(idLessThanZeroErrorMessage)
            }
            
            val deleted = failureService.delete(id)
            if (deleted) {
                ResponseEntity.ok(SuccessResponse("Falha deletada com sucesso"))
            } else {
                throw IllegalArgumentException("Falha não encontrada com ID: $id")
            }
        } catch (e: Exception) {
            logger.error("Erro ao deletar falha com ID $id: ${e.message}", e)
            throw e
        }
    }

    @GetMapping("/{id}/video")
    fun getVideoUrl(@PathVariable id: Int): ResponseEntity<VideoUrlResponse> {
        return try {
            if (id <= 0) {
                throw IllegalArgumentException(idLessThanZeroErrorMessage)
            }
            
            val videoUrl = failureService.getVideoUrl(id)
            if (videoUrl != null) {
                ResponseEntity.ok(VideoUrlResponse(videoUrl))
            } else {
                throw IllegalArgumentException("Vídeo não encontrado para a falha com ID: $id")
            }
        } catch (e: Exception) {
            logger.error("Erro ao obter URL do vídeo para falha $id: ${e.message}", e)
            throw e
        }
    }
}
