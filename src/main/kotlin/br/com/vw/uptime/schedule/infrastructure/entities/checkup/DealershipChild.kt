package br.com.vw.uptime.schedule.infrastructure.entities.checkup

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean

@DynamoDbBean
class DealershipChild {

    @get:DynamoDbAttribute("id")
    lateinit var id:String

    @get:DynamoDbAttribute("fantasyName")
    lateinit var fantasyName: String

    @get:DynamoDbAttribute("state")
    lateinit var state: String

    @get:DynamoDbAttribute("city")
    lateinit var city: String

    @get:DynamoDbAttribute("cep")
    var  cep: String = ""

    @get:DynamoDbAttribute("telephone")
    var  telephone: String = ""

    @get:DynamoDbAttribute("address")
    var  address: String = ""

    @get:DynamoDbAttribute("neighborhood")
    var neighborhood: String = ""

    @get:DynamoDbAttribute("latitude")
    var latitude:Double = 0.0

    @get:DynamoDbAttribute("longitude")
    var longitude:Double = 0.0

    @get:DynamoDbAttribute("website")
    var  website: String = ""

    @get:DynamoDbAttribute("whatsapp")
    var  whatsapp: String = ""

    @get:DynamoDbAttribute("instagram")
    var  instagram: String = ""
}