package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.infrastructure.services.TableCopyService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest
import software.amazon.awssdk.services.dynamodb.model.ScanRequest
import software.amazon.awssdk.services.dynamodb.model.ScanResponse

@RestController
@RequestMapping("/v1/db")

class DbController(
    val dynamoDbClient: DynamoDbClient,
    val tableCopyService: TableCopyService
) {

    @GetMapping("/del")
    fun del() {
        delTable("checkupSchedule")
        delTable("dealership")
    }

    @GetMapping("/copy-to-dealership")
    fun copyToDealership() {
        tableCopyService.dealershipToDataBase()
    }

    @GetMapping("/migrate")
    fun migrate() {
        tableCopyService.dealershipToDataBase()
    }

    fun delTable(tableName:String) {
        try {
            // Perform a scan to get all items in the table
            val scanRequest = ScanRequest.builder()
                .tableName(tableName)
                .build()

            val scanResponse: ScanResponse = dynamoDbClient.scan(scanRequest)
            val items = scanResponse.items()

            if (items.isEmpty()) {
                println("The table is already empty.")
                return
            }

            // Iterate over the items and delete them
            for (item in items) {
                // Extract the primary key(s) for the delete operation
                val primaryKey = mapOf(
                    "id" to item["id"], // Adjust for your table schema // Include if using a sort key
                )

                val deleteRequest = DeleteItemRequest.builder()
                    .tableName(tableName)
                    .key(primaryKey)
                    .build()

                dynamoDbClient.deleteItem(deleteRequest)
                println("Deleted item: $primaryKey")
            }

            println("All items have been deleted.")

        } catch (e: Exception) {
            println("Failed to delete items: ${e.message}")
            throw e
        }
    }

}