package br.com.vw.uptime.schedule.infrastructure.services.failure

import br.com.vw.uptime.schedule.infrastructure.entities.failure.FailureEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.failure.FailureRepository
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import br.com.vw.uptime.schedule.infrastructure.storage.S3Component
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDateTime

@Service
class FailureService(
    private val failureRepository: FailureRepository,
    private val s3Component: S3Component,
    private val userAuthService: UserAuthServiceImpl
) {

    @Transactional(readOnly = true)
    fun findAll(pageable: Pageable): Page<FailureEntity> {
        return failureRepository.findAll(pageable)
    }

    @Transactional(readOnly = true)
    fun findAllByTitle(title: String, pageable: Pageable): Page<FailureEntity> {
        return failureRepository.findByTitleContainingIgnoreCase(title, pageable)
    }

    @Transactional(readOnly = true)
    fun findById(id: Int): FailureEntity? {
        return failureRepository.findById(id).orElse(null)
    }

    @Transactional
    fun create(failure: FailureEntity, videoFile: MultipartFile?): FailureEntity {
        //val userAuth = userAuthService.usr()
        failure.createdBy = "" //userAuth.userId
        failure.createdAt = LocalDateTime.now()
        
        val savedFailure = failureRepository.save(failure)
        
        if (videoFile != null && !videoFile.isEmpty) {
            val videoFilename = "failure_${savedFailure.id}_${videoFile.originalFilename}"
            s3Component.saveDocument("failures/${savedFailure.id}/$videoFilename", videoFile)
            
            savedFailure.videoFilename = videoFilename
            failureRepository.save(savedFailure)
        }
        
        return savedFailure
    }

    @Transactional
    fun update(id: Int, failure: FailureEntity, videoFile: MultipartFile?): FailureEntity? {
        val existingFailure = failureRepository.findById(id).orElse(null)
        if (existingFailure != null) {
            existingFailure.title = failure.title
            existingFailure.description = failure.description
            existingFailure.updatedAt = LocalDateTime.now()
            
            if (videoFile != null && !videoFile.isEmpty) {
                val videoFilename = "failure_${id}_${videoFile.originalFilename}"
                s3Component.saveDocument("failures/$id/$videoFilename", videoFile)
                
                existingFailure.videoFilename = videoFilename
            }
            
            return failureRepository.save(existingFailure)
        }
        return null
    }

    @Transactional
    fun delete(id: Int): Boolean {
        return if (failureRepository.existsById(id)) {
            val failure = failureRepository.findById(id).orElse(null)
            failure?.videoFilename?.let { filename ->
                try {
                    s3Component.deleteFile("failures/$id/$filename")
                } catch (e: Exception) {
                    println("Erro ao deletar arquivo do S3: ${e.message}")
                }
            }
            
            failureRepository.deleteById(id)
            true
        } else {
            false
        }
    }
    
    fun getVideoUrl(failureId: Int): String? {
        val failure = failureRepository.findById(failureId).orElse(null)
        return failure?.videoFilename?.let { filename ->
            try {
                val files = s3Component.listDocuments("failures/$failureId")
                files.find { it.name == filename }?.link
            } catch (e: Exception) {
                null
            }
        }
    }
}
