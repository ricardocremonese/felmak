package br.com.vw.uptime.schedule.infrastructure.services.maintenance

import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.ModelCodeEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.ModelCodeRepository
import io.awspring.cloud.dynamodb.DynamoDbTemplate
import org.springframework.stereotype.Service
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest

@Service
class ModelCodeService(
    private val modelCodeRepository: ModelCodeRepository,
    private val dynamoDbTemplate: DynamoDbTemplate
) {

    fun findByModelCode(modelCode: String): ModelCodeEntity? {
        return modelCodeRepository.findByModelCode(modelCode)
    }

    fun findAllModels(): List<ModelCodeEntity> {
        val scanRequest = ScanEnhancedRequest.builder().build()
        val scanResponse = dynamoDbTemplate.scan(scanRequest, ModelCodeEntity::class.java)
        return scanResponse.items().toList()
    }
} 