package br.com.vw.uptime.schedule.core.configs.properties

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.bind.ConstructorBinding


@ConfigurationProperties(prefix = "occurrence.permission.account")
data class OccurrencePermissions @ConstructorBinding constructor(val tower: String, val allianz: String)
