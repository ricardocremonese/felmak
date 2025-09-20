package br.com.vw.uptime.schedule.infrastructure.entities.dealership

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey

@DynamoDbBean
class   DealershipFavoriteEntity {

    @get:DynamoDbPartitionKey
    lateinit var id: String

    @get:DynamoDbAttribute("dealershipId")
    lateinit var dealershipId: String

    @get:DynamoDbAttribute("accountId")
    var  accountId: String = ""

    @get:DynamoDbAttribute("userId")
    var  userId: String = ""

    @get:DynamoDbAttribute("favorite")
    var favorite: Boolean = false

    @get:DynamoDbAttribute("fantasyName")
    lateinit var fantasyName: String

    @get:DynamoDbAttribute("state")
    var state: String? = null

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