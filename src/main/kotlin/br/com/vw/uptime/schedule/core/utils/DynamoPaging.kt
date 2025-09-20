package br.com.vw.uptime.schedule.core.utils

import io.awspring.cloud.dynamodb.DynamoDbTemplate
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest
import software.amazon.awssdk.services.dynamodb.model.AttributeValue

class DynamoPaging(
    val dynamoDbTemplate: DynamoDbTemplate
) {

    inline fun <reified T : Any?> paginateResults(pageNumber:Int, scanRequestBuilder: ScanEnhancedRequest.Builder) : List<T> {
        var lastEvaluatedKey: Map<String, AttributeValue>? = null
        var currentPage = 1
        var results: List<T> = emptyList()

        while (currentPage <= pageNumber) {
            val scanRequest = if (lastEvaluatedKey != null) {
                scanRequestBuilder.exclusiveStartKey(lastEvaluatedKey).build()
            } else {
                scanRequestBuilder.build()
            }

            val page = dynamoDbTemplate.scan(scanRequest, T::class.java).first()

            if (currentPage == pageNumber) {
                results = page.items()
            }

            // Update LastEvaluatedKey for the next iteration
            lastEvaluatedKey = page.lastEvaluatedKey()

            // If no more results and the requested page is not reached
            if (lastEvaluatedKey == null && currentPage < pageNumber) {
                throw IllegalArgumentException("Page number exceeds the total number of pages")
            }

            currentPage++
        }
        return results
    }
}