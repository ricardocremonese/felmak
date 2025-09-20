package br.com.vw.uptime.schedule.core.configs

import br.com.vw.uptime.schedule.core.configs.properties.AwsProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Profile
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import java.net.URI


@Configuration
class S3ClientConfig(private val awsProperties: AwsProperties) {

    @Bean
    @Profile("prd || hml || sts || dev")
    fun s3Client(awsCredentialsProvider: AwsCredentialsProvider) : S3Client {
        return S3Client.builder()
            .region(Region.of(awsProperties.region))
            .credentialsProvider(awsCredentialsProvider)
            .build()
    }

    @Bean
    @Primary
    @Profile("localstack")
    fun s3ClientLocalstack(awsCredentialsProvider: AwsCredentialsProvider) : S3Client {
        return S3Client.builder()
        .region(Region.of(awsProperties.region))
        .credentialsProvider(awsCredentialsProvider)
        .endpointOverride(URI.create(awsProperties.local!!))
        .forcePathStyle(true)
        .build()
    }

    @Bean
    @Profile("lcl")
    fun s3ClientLocal() : S3Client {
        return S3Client.builder()
            .region(Region.of(awsProperties.region))
            .credentialsProvider {
                AwsBasicCredentials.create("a", "b")
            }
            .endpointOverride(URI.create(awsProperties.local!!))
            .forcePathStyle(true)
            .build()
    }

    @Profile("lcl")
    @Bean
    fun s3PreSignerLocal(): S3Presigner {
        return S3Presigner.builder()
            .region(Region.of(awsProperties.region))
            .credentialsProvider {
                AwsBasicCredentials.create("a", "b")
            }
            .build()
    }

    @Profile("!lcl")
    @Bean
    fun s3PreSigner(awsCredentialsProvider: AwsCredentialsProvider): S3Presigner {
        return S3Presigner.builder()
            .region(Region.of(awsProperties.region))
            .credentialsProvider(awsCredentialsProvider)
            .build()
    }
}