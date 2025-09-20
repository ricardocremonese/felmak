package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import com.fasterxml.jackson.annotation.JsonProperty

data class Failure(
    @JsonProperty("failureType")
    val failureType: String,
    
    @JsonProperty("failureMode")
    val failureMode: String,

    @JsonProperty("failureChecked")
    val failureChecked: Boolean? = null
) 