package br.com.vw.uptime.schedule.core.utils

import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import com.fasterxml.jackson.databind.exc.InvalidFormatException
import org.slf4j.LoggerFactory
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.context.request.WebRequest
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import java.io.PrintWriter
import java.io.StringWriter
import java.util.function.Consumer


@ControllerAdvice
class GlobalExceptionHandler {

    private val log = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)
    private val nonTreatedExceptionMessage = "Non treated Exception was thrown from a request"

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationExceptions(ex: MethodArgumentNotValidException): ResponseEntity<Map<String, String?>> {
        val errors: MutableMap<String, String?> = HashMap()
            ex.bindingResult.fieldErrors.forEach(Consumer { error: FieldError ->
                errors[error.field] = error.defaultMessage
            }
        )
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(errors)
    }

    @ExceptionHandler(BusinessException::class)
    fun handleBusinessException(ex: BusinessException): ResponseEntity<Map<String, String>> {
        val response = mapOf(
            "code" to ex.errorCode.code,
            "message" to ex.errorCode.message
        )
        return ResponseEntity(response, HttpStatus.UNPROCESSABLE_ENTITY)
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException::class)
    fun handleBusinessException(ex: MethodArgumentTypeMismatchException): ResponseEntity<Map<String, String>> {
        val response = mapOf(
            "code" to HttpStatus.BAD_REQUEST.value().toString(),
            "message" to "Invalid Request. Check your request."
        )
        log.error("Error to process the request [{}]", ex.message, ex)
        return ResponseEntity(response, HttpStatus.UNPROCESSABLE_ENTITY)
    }

    @ExceptionHandler(InvalidFormatException::class)
    fun handleInvalidFormat(ex: InvalidFormatException): ResponseEntity<Any> {
        val response = ex.path.associate { it.fieldName to "Formato inválido" }
        return ResponseEntity
            .badRequest()
            .contentType(MediaType.APPLICATION_JSON)
            .body(response)
    }

    @ExceptionHandler(Exception::class)
    fun anyException(ex: Exception): ResponseEntity<Any> {
        val jsonLog = JsonLog()
            .exception(ex)
            .message(nonTreatedExceptionMessage)
        log.error(jsonLog.error())

        val errorResponse = mapOf(
            "message" to ex.message,
            "exception" to stackTrace(ex)
        )
        return ResponseEntity(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR)
        //throw ex
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleInvalidJson(
        ex: HttpMessageNotReadableException,
        request: WebRequest
    ): ResponseEntity<Any> {
        val errorResponse = mapOf(
            "message" to "Invalid JSON input",
            "details" to ex.message
        )
        val jsonLog = JsonLog()
            .exception(ex)
            .message(nonTreatedExceptionMessage)
        log.warn(jsonLog.warn())
        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleInvalidJson( ex: DataIntegrityViolationException, request: WebRequest,): ResponseEntity<Any> {
        val errorResponse = mapOf(
            "message" to "Failed to save the data",
            "details" to "Failed to save the data. Please try again, and if the error persists, contact the administrator."
        )
        val jsonLog = JsonLog()
            .exception(ex)
            .message(nonTreatedExceptionMessage)
        log.warn(jsonLog.warn())
        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    private fun stackTrace(ex:Exception) : String {
        val sw = StringWriter()
        val pw = PrintWriter(sw)
        ex.printStackTrace(pw)
        return sw.toString()
    }
}