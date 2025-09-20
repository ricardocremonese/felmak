package br.com.vw.uptime.schedule.core.configs.properties

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "aws.dynamodb")
data class DynamoConfigProperties(val suffix: String = "")  {}
