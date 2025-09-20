package br.com.vw.uptime.schedule.core.configs

import br.com.vw.uptime.schedule.core.configs.properties.AwsProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Profile
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.AwsCredentials
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider
import software.amazon.awssdk.services.sts.StsClient
import software.amazon.awssdk.services.sts.auth.StsAssumeRoleCredentialsProvider
import software.amazon.awssdk.services.sts.model.AssumeRoleRequest


@Configuration
class CustomCredentialsProvider(private val awsProperties: AwsProperties) {

    @Bean
    @Profile("prd || hml || dev")
    fun getSessionCredentialsProviderCloud(): AwsCredentialsProvider {
        return DefaultCredentialsProvider.create()
    }

    @Bean
    @Profile("lcl")
    fun resolveCredentials(): AwsCredentialsProvider {
        return AwsCredentialsProvider {
            AwsBasicCredentials.create("test", "test")
        }
    }

    @Bean
    @Primary
    @Profile("sts")
    fun getSessionCredentialsProviderLocal(): AwsCredentialsProvider {
        return StsAssumeRoleCredentialsProvider.builder()
            .stsClient(StsClient.builder().build())
            .refreshRequest(AssumeRoleRequest.builder()
                .roleArn(awsProperties.sts?.roleArn)
                .roleSessionName(awsProperties.sts?.sessionName)
                .build())
            .build()
    }
}