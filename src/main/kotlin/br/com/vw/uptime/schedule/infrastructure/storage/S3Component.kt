package br.com.vw.uptime.schedule.infrastructure.storage

import br.com.vw.uptime.schedule.core.filters.LoggingFilter
import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.models.attachment.File
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import software.amazon.awssdk.awscore.presigner.PresignRequest
import software.amazon.awssdk.core.ResponseBytes
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.core.sync.ResponseTransformer
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.*
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest
import java.time.Duration

@Component
class S3Component(private val s3Client: S3Client, private val s3Presigner: S3Presigner) {

    private val log = LoggerFactory.getLogger(LoggingFilter::class.java)

    @Value("\${aws.s3.bucket}")
    lateinit var bucketName: String

    @Value("\${maintenance.attachment.extension.allowed}")
    lateinit var allowedFileExtension:  String

    fun listDocuments(prefix: String) : List<File> {
        log.info("Searching files with prefix: $prefix")

        val listObjectsV2Request = ListObjectsV2Request.builder()
            .bucket(bucketName)
            .prefix("$prefix$DELIMITER")
            .delimiter(DELIMITER)
            .maxKeys(10)
            .build()



            try {
                val s3Response = s3Client.listObjectsV2(listObjectsV2Request)

                val attachments = s3Response.contents().stream()
                    .filter { !it.key().endsWith(DELIMITER) }
                    .map({
                        val metadata = getHeadObject(it.key())
                        File(name = it.key().trim().substringAfterLast(DELIMITER),
                            canonicalName = it.key(),
                            updatedAt = it.lastModified(),
                            contentSize = metadata.contentLength(),
                            contentType = metadata.contentType(),
                            content = null,
                            link = s3Presigner.presignGetObject(it.toGetObjectPreSignRequest()).url().toString()) })
                    .toList()

                log.info("Files with prefix [$prefix] found: $attachments")

                return attachments
            } catch (ex: Exception) {
                log.error("Erro ao listar os arquivos no prefixo $prefix no S3. Bucket $bucketName", ex.message, ex)
                throw BusinessException(ErrorCodeResponse(HttpStatus.INTERNAL_SERVER_ERROR.value().toString(),
                    "Não foi listar os anexos"))
            }
    }

    private fun S3Object.toGetObjectPreSignRequest() : GetObjectPresignRequest {
        return GetObjectPresignRequest.builder()
            .getObjectRequest(GetObjectRequest.builder().bucket(bucketName).key(this.key()).build())
            .signatureDuration(Duration.ofHours(1L))
            .build()
    }

    fun processingDocument(prefix: String, files: List<MultipartFile>) {
        files.forEach { file -> saveDocument("$prefix$DELIMITER${file.originalFilename}", file) }
    }

    fun saveDocument(fileName: String, file: MultipartFile) {
        log.info("Validation: $fileName to save in S3")

        if (file.size == 0L) {
            throw BusinessException(ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(),"Anexo obrigatório"))
        }

        /**
         * 01/08/2025 - Removed validation of file extension to allow any extension
         */
        /* if (ANY_EXTENSION != allowedFileExtension) {
            with(file.originalFilename?.substringAfter(".")) {
                log.info("Original filename $fileName with extension: $this")
                val accept = this?.matches(Regex(allowedFileExtension)) ?: throw BusinessException(ErrorCodeResponse
                (HttpStatus
                    .UNPROCESSABLE_ENTITY.value().toString(),
                    "Extensão de arquivo não permitida"))

                if (!accept) {
                    throw BusinessException(ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(),
                        "Extensão de arquivo não permitida"))
                }
            }
        } */

        log.info("File: $fileName validation ok. It will be saved in S3")

        val objectPutRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(fileName)
            .contentType(file.contentType)
            .build()

        log.info("Dados do arquivo a serem salvos no S3: $objectPutRequest")

        try {
            val response = s3Client.putObject(objectPutRequest, RequestBody.fromBytes(file.bytes))
            log.info("Document filename [$$fileName] saved: $response")
        } catch (ex: Exception) {
            log.error("Erro ao fazer upload do arquivo $fileName no S3. Bucket $bucketName", ex.message, ex)
            throw BusinessException(ErrorCodeResponse(HttpStatus.INTERNAL_SERVER_ERROR.value().toString(),
                "Não foi possível armazenar o arquivo ${file.originalFilename}"))
        }
    }

    fun getFileContent(fileCanonicalPath: String): File? {
        log.info("Getting file content for $fileCanonicalPath")
        val s3Response : ResponseBytes<GetObjectResponse>


        try {
            s3Response = s3Client.getObject(GetObjectRequest.builder().bucket(bucketName).key(fileCanonicalPath)
                .build(), ResponseTransformer.toBytes())
        } catch (ex: NoSuchKeyException) {
            log.error("Não foi localizado nenhum arquivo com nome  $fileCanonicalPath no S3. Bucket $bucketName", ex
                .message, ex)
            throw BusinessException(ErrorCodeResponse(ex.statusCode().toString(),
                "Não foi possível localizar o arquivo ${fileCanonicalPath.substringAfterLast(DELIMITER)}."))
        } catch (ex: Exception) {
            log.error("Erro ao fazer upload do arquivo $fileCanonicalPath no S3. Bucket $bucketName", ex.message, ex)
            throw BusinessException(ErrorCodeResponse(HttpStatus.INTERNAL_SERVER_ERROR.value().toString(),
                "Erro ao realizar o download do arquivo ${fileCanonicalPath.substringAfterLast(DELIMITER)}."))
        }

        log.info("File $fileCanonicalPath found ${s3Response.response()}")

        return s3Response.response()?.let { response ->
            File(name = fileCanonicalPath.substringAfterLast(DELIMITER),
                canonicalName = fileCanonicalPath,
                updatedAt =  response.lastModified(),
                contentSize = response.contentLength(),
                contentType = response.contentType(),
                content = s3Response.asByteArray(),
                link = null)
        }
    }

    fun deleteFile(fileCanonicalPath: String) {
        log.info("Deleting file $fileCanonicalPath")

        try {
            val s3Response = s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(fileCanonicalPath)
                .build())

            s3Response.deleteMarker()?.let {
                log.info("File $fileCanonicalPath delete S3 status $it")
            } ?: log.warn("Não foi localizado nenhum arquivo para delete com o nome $fileCanonicalPath. Bucket S3 $bucketName")

        } catch (ex: Exception) {
            log.error("Erro ao deletar o arquivo $fileCanonicalPath no S3. Bucket $bucketName", ex.message, ex)
            throw BusinessException(ErrorCodeResponse(HttpStatus.INTERNAL_SERVER_ERROR.value().toString(),
                "Não foi possível apagar o arquivo ${fileCanonicalPath.substringAfterLast(DELIMITER)}"))
        }

    }

    fun getHeadObject(canonicalFileName: String): HeadObjectResponse{
        log.info("Getting File details for $canonicalFileName")

        try {
            return s3Client.headObject(HeadObjectRequest.builder()
                .bucket(bucketName)
                .key(canonicalFileName)
                .build())

        } catch (ex: Exception) {
            log.error("Erro ao buscar os metadados do $canonicalFileName no S3. Bucket $bucketName", ex.message, ex)
            throw BusinessException(ErrorCodeResponse(HttpStatus.INTERNAL_SERVER_ERROR.value().toString(),
                "Não foi possível buscar os detalhes do ${canonicalFileName.substringAfterLast(DELIMITER)}"))
        }
    }

    companion object {
        const val DELIMITER : String = "/"
        const val ANY_EXTENSION : String = "*"
    }
}