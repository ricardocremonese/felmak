package br.com.vw.uptime.schedule.core.utils

import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import java.lang.reflect.Type
import java.time.LocalDateTime

class DateTimeDeserializer : JsonDeserializer<LocalDateTime?> {

    override fun deserialize(jsonElement: JsonElement?, type: Type?, context: JsonDeserializationContext?): LocalDateTime? {
        return jsonElement?.let {
            LocalDateTime.parse(it.asString)
        }
    }
}