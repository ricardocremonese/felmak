package br.com.vw.uptime.schedule.infrastructure.entities.consultant

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey


@DynamoDbBean
class ConsultantEntity {

    @get:DynamoDbPartitionKey
    var id: String = ""

    @get:DynamoDbAttribute("dn")
    var dn: String = ""

    @get:DynamoDbAttribute("accountId")
    var accountId: String = ""

    @get:DynamoDbAttribute("firstName")
    var firstName: String = ""

    @get:DynamoDbAttribute("lastName")
    var lastName: String = ""

    @get:DynamoDbAttribute("email")
    var email: String? = null

    @get:DynamoDbAttribute("phoneNumber")
    var phoneNumber: String? = null

}