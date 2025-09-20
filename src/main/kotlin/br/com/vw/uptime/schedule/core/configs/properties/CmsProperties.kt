package br.com.vw.uptime.schedule.core.configs.properties

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.bind.ConstructorBinding


@ConfigurationProperties(prefix = "cms")
data class CmsProperties @ConstructorBinding constructor(val url: String, val username: String, val passwd: String)
