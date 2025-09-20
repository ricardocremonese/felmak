package br.com.vw.uptime.schedule.infrastructure.entities.checkup

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import java.math.BigDecimal
import java.time.LocalDate

@DynamoDbBean
class CampaignScheduleChild {

    @get:DynamoDbAttribute("number")
    lateinit var number:String

    @get:DynamoDbAttribute("name")
    lateinit var name:String

    @get:DynamoDbAttribute("dn")
    lateinit var dn:String

    @get:DynamoDbAttribute("vehicle")
    var vehicle: String? = null

    @get:DynamoDbAttribute("classification")
    lateinit var classification:String

    @get:DynamoDbAttribute("validityFrom")
    lateinit var validityFrom:LocalDate

    @get:DynamoDbAttribute("validityUntil")
    lateinit var validityUntil:LocalDate

    @get:DynamoDbAttribute("averagePrice")
    lateinit var averagePrice:BigDecimal

    @get:DynamoDbAttribute("campaignYear")
    lateinit var campaignYear:String

    @get:DynamoDbAttribute("campaignStatus")
    lateinit var campaignStatus:String

    @get:DynamoDbAttribute("repairDate")
    var repairDate: LocalDate? = null

    @get:DynamoDbAttribute("repairStatus")
    lateinit var repairStatus:String



}