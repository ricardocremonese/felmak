package br.com.vw.uptime.schedule.core.configs

import br.com.vw.uptime.schedule.core.configs.properties.AwsProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Profile
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.sqs.SqsAsyncClient
import java.net.URI


@Configuration
class SqsConfig(private val awsProperties: AwsProperties) {

    @Bean
    @Profile("prd || hml || dev || sts")
    fun sqsAsyncClient(awsCredentialsProvider: AwsCredentialsProvider?): SqsAsyncClient {
        return SqsAsyncClient.builder()
            .region(Region.of(awsProperties.region))
            .credentialsProvider(awsCredentialsProvider)
            .build()
    }

    @Bean
    @Primary
    @Profile("localstack")
    fun sqsAsyncClientLocalstack(awsCredentialsProvider: AwsCredentialsProvider): SqsAsyncClient {
        return SqsAsyncClient.builder()
            .region(Region.of(awsProperties.region))
            .endpointOverride(URI(awsProperties.local!!))
            .credentialsProvider(awsCredentialsProvider)
            .build()
    }

    @Bean
    @Profile("lcl")
    fun sqsAsyncClientLocal(): SqsAsyncClient {
        return SqsAsyncClient.builder()
            .region(Region.of(awsProperties.region))
            .endpointOverride(URI(awsProperties.local!!))
            .credentialsProvider {
                AwsBasicCredentials.create("test", "test")
            }
            .build()
    }
}