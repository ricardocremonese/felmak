package br.com.vw.uptime.schedule.infrastructure.entities.asset

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbIgnoreNulls
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey
import java.time.LocalDateTime

@DynamoDbBean
class UptimeAssetEntity {
    @get:DynamoDbPartitionKey
    lateinit var chassis: String
    var odometer: Long? = null
    var lastOdometerUpdate: LocalDateTime? = null
    var hourmeter: Long? = null
    var lastHourmeterUpdate: LocalDateTime? = null
    @get:DynamoDbIgnoreNulls
    var odp: OdpDbEntity? = null
}

@DynamoDbBean
class OdpDbEntity {
    var chassis: String? = null
    var maintenanceGroup: String? = null
    var modelDescription: String? = null
    var modelCode: String? = null
    var warranty: WarrantyData? = null
    var order:Order? = null
    var volkstotal: VolksTotalData? = null
    var revisions: List<RevisionData>? = null
}
@DynamoDbBean
class WarrantyData {
    var start: LocalDateTime? = null
    var end: LocalDateTime? = null
    var generalStart: LocalDateTime? = null
    var generalEnd: LocalDateTime? = null
    var additionalStart: LocalDateTime? = null
    var additionalEnd: LocalDateTime? = null
    var specialStart: LocalDateTime? = null
}

@DynamoDbBean
class VolksTotalData {
    var status: String? = null
    var contractNumber: String? = null
    var modality: String? = null
}

@DynamoDbBean
class Order {
    var saleDate:String? = null
}

@DynamoDbBean
class RevisionData {
    var volkscareRevision: String? = null
    var hourMeter: String? = null
    var mileage: Long? = null
    lateinit var revisionDate: String
    var dealer: String? = null
    var revisionType: String? = null
    var revisionCode: String? = null
    var serviceOrder: String? = null
    var consultantName:String? = null
}