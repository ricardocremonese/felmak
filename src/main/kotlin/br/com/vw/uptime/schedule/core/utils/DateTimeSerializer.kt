package br.com.vw.uptime.schedule.core.utils

import com.google.gson.JsonElement
import com.google.gson.JsonPrimitive
import com.google.gson.JsonSerializationContext
import com.google.gson.JsonSerializer
import java.lang.reflect.Type
import java.time.LocalDateTime

class DateTimeSerializer : JsonSerializer<LocalDateTime> {
        override fun serialize(localDateTime: LocalDateTime?, p1: Type?, p2: JsonSerializationContext?): JsonElement {
            return JsonPrimitive(localDateTime.toString())
        }

}