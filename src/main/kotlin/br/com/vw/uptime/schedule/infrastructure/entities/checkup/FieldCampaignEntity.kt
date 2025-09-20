package br.com.vw.uptime.schedule.infrastructure.entities.checkup

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey
import java.time.LocalDate

@DynamoDbBean
class FieldCampaignEntity {

    @get:DynamoDbPartitionKey
    lateinit var chassis: String

    @get:DynamoDbSortKey
    lateinit var campaignNumber: String

    @get:DynamoDbAttribute("dn")
    lateinit var dn: String

    @get:DynamoDbAttribute("vehicle")
    var vehicle: String? = null

    @get:DynamoDbAttribute("chassisInitial")
    lateinit var chassisInitial: String

    @get:DynamoDbAttribute("chassisFinal")
    lateinit var chassisFinal: String

    @get:DynamoDbAttribute("repairDate")
    var repairDate: LocalDate? = null

    @get:DynamoDbAttribute("repairStatus")
    lateinit var repairStatus:String

    @get:DynamoDbAttribute("campaign")
    lateinit var campaign:CampaignChild

}