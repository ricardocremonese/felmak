package br.com.vw.uptime.schedule.infrastructure.entities.dealership

import br.com.vw.uptime.schedule.infrastructure.repositories.dealerships.DealershipTransRioRepository.Companion.DEALERSHIP_TRANSRIO_CHASSIS_GSI_NAME
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey
import java.math.BigDecimal
import java.time.LocalDate
import kotlin.properties.Delegates

@DynamoDbBean
class DealershipTransRioEntity {

    @get:DynamoDbPartitionKey
    lateinit var id: String

    @get:DynamoDbAttribute("average_km")
    lateinit var averageKm: String

    @get:DynamoDbAttribute("chassis")
    @get:DynamoDbSecondaryPartitionKey(indexNames = [DEALERSHIP_TRANSRIO_CHASSIS_GSI_NAME])
    lateinit var  chassis: String

    @get:DynamoDbAttribute("connected")
    lateinit var connected: String

    @get:DynamoDbAttribute("control_tower")
    lateinit var controlTower: String

    @get:DynamoDbAttribute("field_campaign")
    var  fieldCampaign by Delegates.notNull<Int>()

    @get:DynamoDbAttribute("group_maintenance")
    var maintenanceGroup by Delegates.notNull<Int>()

    @get:DynamoDbAttribute("model")
    lateinit var model: String

    @get:DynamoDbAttribute("model_code")
    lateinit var modelCode: String

    @get:DynamoDbAttribute("next_revision")
    lateinit var nextRevision: BigDecimal

    @get:DynamoDbAttribute("odometer")
    lateinit var odometer: BigDecimal

    @get:DynamoDbAttribute("range")
    var  range: Int by Delegates.notNull<Int>()

    @get:DynamoDbAttribute("revisions")
    lateinit var  revisions: List<BigDecimal>

    @get:DynamoDbAttribute("start_warranty")
    var  startWarranty: LocalDate by Delegates.notNull<LocalDate>()

    @get:DynamoDbAttribute("status_revision")
    lateinit var statusRevision: String

    @get:DynamoDbAttribute("warranty")
    lateinit var warranty: String
}