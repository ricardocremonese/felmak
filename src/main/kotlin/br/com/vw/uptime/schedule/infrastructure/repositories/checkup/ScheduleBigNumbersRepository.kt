package br.com.vw.uptime.schedule.infrastructure.repositories.checkup

import br.com.vw.uptime.schedule.core.enums.schedule.ScheduleStateEnum
import br.com.vw.uptime.schedule.core.utils.LogPoint
import org.springframework.stereotype.Repository
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import software.amazon.awssdk.services.dynamodb.model.ScanRequest

@Repository
class ScheduleBigNumbersRepository(
    private val dynamoDbTable: DynamoDbClient
){
    fun scheduledAmount() : Int {
        return LogPoint("Counting number of schedules").log {
            val scanRequest = ScanRequest
                .builder()
                .tableName("schedule")
                .filterExpression("#stateAttr <> :stateValue")
                .expressionAttributeNames(
                    mapOf(
                        "#stateAttr" to "state"
                    )
                )
                .expressionAttributeValues(
                    mapOf(
                        ":stateValue" to AttributeValue.builder().s(ScheduleStateEnum.REJECTED.state()).build()
                    )
                )
                .select("COUNT")
                .build()

            val response = dynamoDbTable.scan(scanRequest)
            response.count()
        }
    }
}