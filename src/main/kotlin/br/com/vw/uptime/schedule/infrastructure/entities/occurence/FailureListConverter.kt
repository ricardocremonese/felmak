package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter
class FailureListConverter : AttributeConverter<List<Failure>, String> {
    
    private val objectMapper = ObjectMapper()
    
    override fun convertToDatabaseColumn(attribute: List<Failure>?): String? {
        return if (attribute == null || attribute.isEmpty()) {
            null
        } else {
            objectMapper.writeValueAsString(attribute)
        }
    }
    
    override fun convertToEntityAttribute(dbData: String?): List<Failure> {
        return if (dbData.isNullOrBlank()) {
            emptyList()
        } else {
            try {
                objectMapper.readValue(dbData, object : TypeReference<List<Failure>>() {})
            } catch (e: Exception) {
                emptyList()
            }
        }
    }
} 