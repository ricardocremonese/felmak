package br.com.vw.uptime.schedule.entrypoint.responses

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute

class AlertTicketResponse {

    lateinit var id: String
    lateinit var date: String
    lateinit var description: String
    lateinit var vehicleId: String
    lateinit var vehicle: String
    var latitude: Long = 0
    var longitude: Long = 0
    lateinit var vin: String
    lateinit var spn: String
    lateinit var spnDescription: String
    lateinit var fmi: String
    lateinit var fmiDescription: String
    lateinit var lampStatus: String
    lateinit var sourceAddress: String
    lateinit var km: String
}