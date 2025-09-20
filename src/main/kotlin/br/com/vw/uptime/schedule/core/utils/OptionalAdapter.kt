package br.com.vw.uptime.schedule.core.utils

import com.google.gson.*
import java.lang.reflect.Type
import java.util.*

class OptionalAdapter : JsonSerializer<Optional<Any>>, JsonDeserializer<Optional<Any>> {

    override fun serialize(src: Optional<Any>, typeOfSrc: Type?, context: JsonSerializationContext?): JsonElement {
        return if (src.isPresent) {
            context!!.serialize(src.get())
        } else {
            JsonNull.INSTANCE
        }
    }

    override fun deserialize(
        json: JsonElement,
        typeOfT: Type,
        context: JsonDeserializationContext
    ) : Optional<Any>{
        return if (json.isJsonNull) {
            Optional.empty()
        } else {
            Optional.of(context.deserialize(json, typeOfT))
        }
    }

}