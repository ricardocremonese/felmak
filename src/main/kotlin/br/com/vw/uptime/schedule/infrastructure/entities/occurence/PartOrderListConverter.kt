package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter
class PartOrderListConverter : AttributeConverter<List<PartOrder>, String> {
    
    private val objectMapper = ObjectMapper()
    
    override fun convertToDatabaseColumn(attribute: List<PartOrder>?): String? {
        return if (attribute == null || attribute.isEmpty()) {
            null
        } else {
            objectMapper.writeValueAsString(attribute)
        }
    }
    
    override fun convertToEntityAttribute(dbData: String?): List<PartOrder> {
        return if (dbData.isNullOrBlank()) {
            emptyList()
        } else {
            try {
                objectMapper.readValue(dbData, object : TypeReference<List<PartOrder>>() {})
            } catch (e: Exception) {
                emptyList()
            }
        }
    }
} 

@Converter
class PartOrderDeliveryDatesListConverter : AttributeConverter<List<PartOrderDeliveryDates>, String> {
    private val objectMapper = ObjectMapper()

    override fun convertToDatabaseColumn(attribute: List<PartOrderDeliveryDates>?): String? {
        return if (attribute == null || attribute.isEmpty()) {
            null
        } else {
            objectMapper.writeValueAsString(attribute)
        }
    }

    override fun convertToEntityAttribute(dbData: String?): List<PartOrderDeliveryDates> {
        return if (dbData.isNullOrBlank()) {
            emptyList()
        } else {
            try {
                objectMapper.readValue(dbData, object : TypeReference<List<PartOrderDeliveryDates>>() {})
            } catch (e: Exception) {
                emptyList()
            }
        }
    }
}