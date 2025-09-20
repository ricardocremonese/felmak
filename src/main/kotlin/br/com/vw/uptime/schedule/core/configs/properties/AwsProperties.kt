package br.com.vw.uptime.schedule.core.configs.properties

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.bind.ConstructorBinding


@ConfigurationProperties(prefix = "aws")
data class AwsProperties @ConstructorBinding constructor(val region: String?, val sts: StsProperties?, val local: String?, val dynamodb: DynamoDbProperties?)
data class StsProperties @ConstructorBinding constructor(val roleArn: String, val sessionName: String)
data class DynamoDbProperties @ConstructorBinding constructor(val suffix: String)