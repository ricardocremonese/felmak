package br.com.vw.uptime.schedule.core.configs

import br.com.vw.uptime.schedule.core.configs.properties.AwsProperties
import io.awspring.cloud.dynamodb.DynamoDbTableNameResolver
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.AwsCredentials
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import java.net.URI


@Configuration
class DynamoDbConfiguration(private val awsProperties: AwsProperties) {

    @Bean
    @Profile("prd || hml || sts || dev")
    fun dynamoDbClient(awsCredentialsProvider: AwsCredentialsProvider): DynamoDbClient {
        return DynamoDbClient.builder()
            .region(Region.of(awsProperties.region))
            .credentialsProvider(awsCredentialsProvider)
            .build()
    }

    @Bean
    @Profile("localstack")
    fun dynamoDbClientLocalStack(awsCredentialsProvider: AwsCredentialsProvider): DynamoDbClient {
        return DynamoDbClient.builder()
            .endpointOverride(URI.create(awsProperties.local!!))
            .region(Region.of(awsProperties.region))
            .credentialsProvider(awsCredentialsProvider)
            .build()
    }

    @Profile("lcl")
    @Bean
    fun dynamoDbClientLocal(): DynamoDbClient {
        return DynamoDbClient.builder()
            .endpointOverride(URI.create(awsProperties.local!!))
            .region(Region.of(awsProperties.region))
            .credentialsProvider {
                AwsBasicCredentials.create("a", "b")
            }
            .build()
    }

    @Bean
    fun dynamoDbEnhancedClient(dynamoDbClient: DynamoDbClient): DynamoDbEnhancedClient {
        return DynamoDbEnhancedClient.builder()
            .dynamoDbClient(dynamoDbClient)
            .build()
    }

    @Bean
    fun customTableNameResolver(): DynamoDbTableNameResolver {
        return NormalizeDynamoDbTableNameResolver()
    }
}