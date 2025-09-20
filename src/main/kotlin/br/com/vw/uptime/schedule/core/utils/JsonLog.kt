package br.com.vw.uptime.schedule.core.utils

import com.google.gson.Gson
import java.io.PrintWriter
import java.io.StringWriter
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

class JsonLog {

    private val map = mutableMapOf<String, Any?>()

    fun add(attribute:String, value:Any) : JsonLog {
        map[attribute] = value
        return this
    }

    fun request(requestObj: Any): JsonLog {
        map["request"] = requestObj
        return this
    }

    fun message(message:String) : JsonLog {
        map["message"] = message
        return this
    }

    fun response(responseObj:Any?): JsonLog {
        map["request"] = responseObj
        return this
    }

    private fun stackTrace(ex:Exception) : String {
        val sw = StringWriter()
        val pw = PrintWriter(sw)
        ex.printStackTrace(pw)
        return sw.toString()
    }

    fun exception(ex:Exception) : JsonLog {
        map["exception"] = stackTrace(ex)
        return this
    }

    fun elapsedTime(elapsedTime:Long) : JsonLog {
        map["elapsedTime"] = elapsedTime
        return this
    }

    fun info() : String {
        return toJson("info")
    }

    fun warn() : String {
        return toJson("warn")
    }

    private fun toJson(level: String) : String {
        return Gson()
        .newBuilder()
        .registerTypeAdapter(LocalDateTime::class.java, DateTimeSerializer())
        .registerTypeAdapter(Optional::class.java, OptionalAdapter())
            .registerTypeAdapter(LocalDate::class.java, DateSerializer())
        .create()
        .toJson(default(level))
    }

    fun error() : String {
        return toJson("error")
    }

    private fun default(level:String) : Map<String, Any?> {
        map["level"] = level
        map["timestamp"] = LocalDateTime.now().toString()
        return map
    }
}