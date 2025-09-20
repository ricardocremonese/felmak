package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonInclude

data class PartOrder(
    @JsonProperty("number")
    val number: String,
    
    @JsonProperty("status")
    val status: String,

    @JsonProperty("date")
    val date: String
)

@JsonInclude(JsonInclude.Include.ALWAYS)
data class PartOrderDeliveryDates(
    @JsonProperty("expected")
    val expected: String?,

    @JsonProperty("delivered")
    val delivered: String?
)