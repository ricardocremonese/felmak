package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.core.converters.Mapping
import br.com.vw.uptime.schedule.entrypoint.responses.FileResponse
import br.com.vw.uptime.schedule.infrastructure.storage.S3Component
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/v1/attachment")
class AttachmentController(val s3Component: S3Component) {
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/{resource}/{uuid}/upload", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun genericAttach(@RequestParam("file") file: List<MultipartFile>,
               @PathVariable("resource") resource: String,
               @PathVariable("uuid") uuid: String) {
        s3Component.processingDocument("$resource/$uuid", file)
    }

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/{resource}/{uuid}")
    fun genericListFiles(@PathVariable("resource") resource: String,
                  @PathVariable("uuid") uuid: String) : List<FileResponse> {

        return s3Component.listDocuments("$resource/$uuid").stream()
            .map { Mapping.copy(it, FileResponse()) }
            .toList()
    }

    @GetMapping("/{resource}/{uuid}/download", produces = [MediaType.APPLICATION_OCTET_STREAM_VALUE])
    fun genericGetFileContent(@PathVariable("resource") resource: String,
                       @PathVariable("uuid") uuid: String,
                       @PathVariable("fileName") fileName: String) : ResponseEntity<ByteArray> {
        val fileResponse = s3Component.getFileContent("$resource/$uuid/$fileName")

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=${fileResponse?.name}")
            .header(HttpHeaders.CONTENT_TYPE, fileResponse?.contentType)
            .contentLength(fileResponse?.contentSize?.toLong() ?: 0)
            .contentType(MediaType.APPLICATION_OCTET_STREAM).body(fileResponse?.content)
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{resource}/{uuid}/{fileName}")
    fun genericDeleteFile(@PathVariable("resource") resource: String,
                        @PathVariable("uuid") uuid: String,
                   @PathVariable("fileName") fileName: String) {
        s3Component.deleteFile("$resource/$uuid/$fileName")
    }
}