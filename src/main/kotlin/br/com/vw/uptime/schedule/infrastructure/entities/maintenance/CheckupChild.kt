package br.com.vw.uptime.schedule.infrastructure.entities.maintenance

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean

@DynamoDbBean
class CheckupChild {

    @get:DynamoDbAttribute("checkupId")
    lateinit var checkupId:String

    @get:DynamoDbAttribute("name")
    lateinit var name:String

    @get:DynamoDbAttribute("description")
    lateinit var description:String

    @get:DynamoDbAttribute("startRange")
    var startRange:Long = 0

    @get:DynamoDbAttribute("endRange")
    var endRange:Long? = 0
}