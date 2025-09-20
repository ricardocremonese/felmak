package br.com.vw.uptime.schedule.core.filters

import com.google.gson.*
import jakarta.servlet.FilterChain
import jakarta.servlet.ReadListener
import jakarta.servlet.ServletInputStream
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletRequestWrapper
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.web.filter.OncePerRequestFilter
import org.springframework.web.util.ContentCachingResponseWrapper
import java.io.ByteArrayInputStream
import java.io.InputStream
import java.nio.charset.StandardCharsets
import java.time.LocalDate
import java.time.LocalDateTime

class LoggingFilter(private val jwksUrl: String) : OncePerRequestFilter() {

    private val log = LoggerFactory.getLogger(LoggingFilter::class.java)

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {


        if (request.method.equals("OPTIONS", ignoreCase = true) || request.contentType?.contains(MediaType
            .MULTIPART_FORM_DATA_VALUE) == true) {
            filterChain.doFilter(request, response)
            return
        }

        val cachedBody = request.inputStream.readBytes()
        val requestBody = String(cachedBody, StandardCharsets.UTF_8)
        log.debug(createLogRequest(requestBody, request))

        val inputStream = ByteArrayInputStream(cachedBody)
        val requestWrapper = CachedRequestWrap(request, inputStream)
        val responseWrapper = ContentCachingResponseWrapper(response)
        checkDoFilter(requestWrapper, responseWrapper, filterChain)
        val responseBody = String(responseWrapper.contentAsByteArray, StandardCharsets.UTF_8)
        log.debug(createLogResponse(responseBody, responseWrapper))
        responseWrapper.copyBodyToResponse()

    }

    private fun checkDoFilter(
        requestWrapper: CachedRequestWrap,
        responseWrapper: ContentCachingResponseWrapper,
        filterChain: FilterChain
    )
    {
        if(Auth(requestWrapper, responseWrapper, jwksUrl).authenticate()) {
            filterChain.doFilter(requestWrapper, responseWrapper)
        }
    }

    private fun createLogResponse(responseBody: String, response: HttpServletResponse): String {
        val contentType:String? = response.contentType

        val jsonResponseBody = jsonElementOrString(responseBody, contentType)
        val jsonLog = JsonObject()
        with(jsonLog) {
            addProperty("status", response.status)
            add("response", jsonResponseBody)
            addProperty("timestamp", LocalDateTime.now().toString())
        }
        return jsonLog.toString()
    }

    private fun createLogRequest(requestStr:String, httpServletRequest: HttpServletRequest) : String{
        val contentType = httpServletRequest.contentType
        val jsonResponseBody = jsonElementOrString(requestStr, contentType)
        val jsonLog = JsonObject()
        with(jsonLog) {
            addProperty("url", createFullUrl(httpServletRequest))
            add("request", jsonResponseBody)
            addProperty("timestamp", LocalDate.now().toString())
        }
        return jsonLog.toString()

    }

    private fun jsonElementOrString(requestStr: String, contentType: String?): JsonElement {
        return try {
            if(contentType != null && contentType == MediaType.APPLICATION_JSON_VALUE) {
                JsonParser.parseString(requestStr)
            } else {
                JsonPrimitive(requestStr)
            }
        } catch (_: JsonSyntaxException) {
            JsonPrimitive(requestStr)
        }
    }

    private fun createFullUrl(request: HttpServletRequest): String {
        val requestURL = StringBuilder(request.requestURL.toString()) // Start with the base URL

        // Append the query string if it exists
        request.queryString?.let {
            requestURL.append("?").append(it)
        }

        return requestURL.toString()
    }


    class CachedRequestWrap(request: HttpServletRequest, val originalInputStream: InputStream) : HttpServletRequestWrapper(request) {
        override fun getInputStream(): ServletInputStream {
            return object : ServletInputStream() {
                override fun read(): Int {
                    return originalInputStream.read()
                }

                override fun read(b: ByteArray): Int {
                    return originalInputStream.read(b)
                }

                override fun read(b: ByteArray, off: Int, len: Int): Int {
                    return originalInputStream.read(b, off, len)
                }

                override fun isFinished(): Boolean {
                    return false
                }

                override fun isReady(): Boolean {
                    TODO("Not yet implemented")
                }

                override fun setReadListener(p0: ReadListener?) {
                    TODO("Not yet implemented")
                }

            }
        }
    }
}