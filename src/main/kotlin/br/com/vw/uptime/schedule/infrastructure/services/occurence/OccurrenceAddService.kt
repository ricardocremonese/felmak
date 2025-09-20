package br.com.vw.uptime.schedule.infrastructure.services.occurence

import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.core.models.dealership.Dealership
import br.com.vw.uptime.schedule.core.utils.TimeUtils
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.*
import br.com.vw.uptime.schedule.infrastructure.repositories.assistance.OccurrenceDynamicsSaveResponse
import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.OccurrenceRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.users.User
import br.com.vw.uptime.schedule.infrastructure.services.asset.AssetTowerAndCustomerIds
import br.com.vw.uptime.schedule.infrastructure.services.asset.AssetsDbService
import br.com.vw.uptime.schedule.infrastructure.services.assistance.CountryOccurrenceDynamics
import br.com.vw.uptime.schedule.infrastructure.services.assistance.OccurrenceDynamicsService
import br.com.vw.uptime.schedule.infrastructure.services.assistance.OccurrenceIntegrationSaveRequest
import br.com.vw.uptime.schedule.infrastructure.services.dealership.DealershipServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.user.UsersServiceImpl
import com.fasterxml.jackson.annotation.JsonCreator
import jakarta.validation.Valid
import jakarta.validation.constraints.*
import org.hibernate.exception.ConstraintViolationException
import org.springframework.beans.factory.annotation.Value
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*


@Service
class OccurrenceAddService(
    private val occurrenceRepository: OccurrenceRepository,
    private val dealershipServiceImpl: DealershipServiceImpl,
    private val assetsDbService: AssetsDbService,
    private val occurrenceDynamicsService:OccurrenceDynamicsService,
    private val serviceBayScheduleService: ServiceBayScheduleService,
    private val usersServiceImpl: UsersServiceImpl
) {

    @Value("\${tower-account-id}")
    private lateinit var controlTowerAccountId: String

    @Transactional(readOnly = false, rollbackFor = [Exception::class])
    fun create(occurrenceAddRequest:OccurrenceAddRequest, usr:UserAuthenticate, saveInDynamics: Boolean = true) : Occurrence {
        validateDealership(occurrenceAddRequest)
        val assetIdsAccount = assetsDbService.getAssetIdsAccountByChassis(
            occurrenceAddRequest.vehicle!!.chassis!!,
            usr,
            controlTowerAccountId
        )
        val user = usersServiceImpl.getUserById(userId = usr.userId)
        val occurrenceEntity = toOccurrenceEntity(occurrenceAddRequest, assetIdsAccount, user)
        val savedOccurrenceEntity = saveOccurrence(occurrenceEntity)
        saveServiceBaySchedule(savedOccurrenceEntity, occurrenceAddRequest, usr, user)
        if(saveInDynamics) {
            val response = saveToDynamics(occurrenceAddRequest, savedOccurrenceEntity)
            if(response != null) {
                savedOccurrenceEntity.protocolNumber = response.ticketnumber
            }
        }
        occurrenceRepository.save(savedOccurrenceEntity)

        return Occurrence().apply {
            uuid = occurrenceEntity.uuid
        }
    }

    private fun saveServiceBaySchedule(savedOccurrenceEntity: OccurrenceEntity, occurrenceAddRequest: OccurrenceAddRequest, userAuth:UserAuthenticate, user:User): ServiceBayScheduleResponse? {
        return occurrenceAddRequest.serviceBaySchedule?.let { servBayReq ->
            serviceBayScheduleService.add(
                ServiceBayScheduleRequest().apply {
                    this.startDate = servBayReq.startDate
                    this.endDate = servBayReq.endDate
                    this.serviceBayId = servBayReq.serviceBayId
                    this.dn = occurrenceAddRequest.dealership!!.dn
                },
                userAuth,
                user,
                savedOccurrenceEntity
            )
        }
    }

    private fun saveOccurrence(occurrenceEntity: OccurrenceEntity): OccurrenceEntity {
        try {
            return occurrenceRepository.save(occurrenceEntity)
        } catch (ex: DataIntegrityViolationException) {
            val cause = ex.cause
            if (cause is ConstraintViolationException && cause.constraintName == "ux_occurrence_chassis_end_date") {
                throw BusinessException(
                    ErrorCode.OCCURRENCE_NOT_FINISHED.toResponse()
                )
            } else {
                throw ex
            }
        }
    }

    private fun saveToDynamics(occurrenceAddRequest: OccurrenceAddRequest, occurrenceEntity: OccurrenceEntity): OccurrenceDynamicsSaveResponse? {
        if(occurrenceAddRequest.occurrenceType == OccurrenceType.PREVENTIVE) {
            return null
        }
        val chassis = occurrenceAddRequest.vehicle?.chassis
        if(chassis == null) {
            return null

        }
        return occurrenceDynamicsService.save(
            OccurrenceIntegrationSaveRequest(
                chassis = chassis,
                occurrenceType = OccurrenceType.ASSISTANCE,
                occurrenceUuid = occurrenceEntity.uuid,
                country = CountryOccurrenceDynamics.valueOfOrDefault(
                    occurrenceAddRequest.requestingCountry?.trim() ?: "",
                    CountryOccurrenceDynamics.BRASIL
                )
            )
        )
    }

    private fun toOccurrenceDealershipEntity(occurrenceAddRequest: OccurrenceAddRequest, occurrence: OccurrenceEntity): OccurrenceDealershipEntity {
        val dealershipRequest = occurrenceAddRequest.dealership!!
        return dealershipRequest.let {
            OccurrenceDealershipEntity(
                dn = it.dn,
                occurrence = occurrence,
                local = it.local,
                representative = it.representative,
                regional = it.regional,
                area = it.area,
                cellNumber = it.cellNumber
            )
        }
    }

    private fun validateDealership(occurrenceAddRequest: OccurrenceAddRequest): Dealership {
        val dealership = dealershipServiceImpl.dealershipById(occurrenceAddRequest.dealership!!.dn!!)
        return dealership
    }


    private fun toOccurrenceEntity(
        occurrenceAddRequest: OccurrenceAddRequest,
        assetIdsAccounts: AssetTowerAndCustomerIds,
        user: User,
    ): OccurrenceEntity {
        val now = LocalDateTime.now()
        val occurrenceVehicleRequest = occurrenceAddRequest.vehicle
        val driverRequest = occurrenceAddRequest.driver
        val occurrenceStepEntity = OccurrenceStepEntity(
            observation = occurrenceAddRequest.observation,
            report = occurrenceAddRequest.report,
            dtStart = LocalDateTime.now(),
            expectedDtEnd = occurrenceAddRequest.expectedEndDate,
            estimatedTime = occurrenceAddRequest.estimatedTime?.let { TimeUtils.durationToTotalMinutes(it) },
            stepId = StepTypeOccurrence.TICKE,
            latest = 1,
            updatedBy = user.firstName + " " + user.lastName,
            updatedByUuid = user.accountId,
            updatedAt = now
        )
        val occurrencePartOrderEntity = OccurrencePartOrderEntity()
        val occurrenceVehicleEntity = OccurrenceVehicleEntity(
            chassis = occurrenceVehicleRequest?.chassis!!,
            assetId = assetIdsAccounts.customerAssetId,
            assetTowerId = assetIdsAccounts.towerAssetId,
            model = occurrenceVehicleRequest.model,
            licensePlate = occurrenceVehicleRequest.licencePlace,
            vehicleType = occurrenceVehicleRequest.vehicleType,
            name = occurrenceVehicleRequest.vehicleName,
            vehicleYear = occurrenceVehicleRequest.vehicleYear,
            odometer = occurrenceVehicleRequest.odometer,
            hourMeter = occurrenceVehicleRequest.hourMeter,
            stopped = booleanToYesNo(occurrenceAddRequest.stopped),
            payloadType = occurrenceAddRequest.payloadType,
            maximumPayload = occurrenceAddRequest.loadWeight,
            criticalPayload = booleanToYesNo(occurrenceAddRequest.criticalLoad),
            emissionStandard = occurrenceVehicleRequest.legislation
        )
        val occurrenceEntity = OccurrenceEntity(
            chassis = occurrenceVehicleRequest.chassis,
            currentStep = StepTypeOccurrence.TICKE,
            criticality = occurrenceAddRequest.criticality,
            createdBy = user.firstName + " " + user.lastName,
            createdByUuid = user.accountId,
            createdByUserProfileId = occurrenceAddRequest.createdByUserProfileId,
            dtcs = occurrenceAddRequest.dtcs.map {
                dtcRequestToEntity(it)
            }.toCollection(ArrayList()),
            occurrenceType = occurrenceAddRequest.occurrenceType?.type,
            timeOpenProtocol = occurrenceAddRequest.timeOpenProtocol?.let {
                TimeUtils.durationToTotalMinutes(it)
            },
            country = occurrenceAddRequest.requestingCountry,
            hasLink = occurrenceAddRequest.hasLink,
            mainOccurrence = occurrenceAddRequest.mainOccurrence,
            source = occurrenceAddRequest.origin,
            observation = occurrenceAddRequest.observation,
            status = occurrenceAddRequest.status,
            customer = occurrenceVehicleRequest.customer,
            renter = occurrenceVehicleRequest.renter,
            uuid = UUID.randomUUID().toString(),
            accountUuid = assetIdsAccounts.customerAccountId ?: "",
            partnerId = occurrenceAddRequest.partnerId,
            updatedAt = null,
            createdAt = now,
            vehicle = occurrenceVehicleEntity,
            driver = driverRequest!!.let {
                OccurrenceDriverEntity(
                    name = it.name,
                    phone = it.phone,
                    driverLicenseNumber = it.driverLicenseNumber
                )
            },
            occurrenceSteps = mutableListOf(occurrenceStepEntity),
            partOrder = occurrencePartOrderEntity
        )
        occurrenceEntity.vehicle?.occurrence = occurrenceEntity
        occurrenceEntity.driver?.occurrence = occurrenceEntity
        occurrenceEntity.dtcs.map {
            it.occurrence = occurrenceEntity
        }
        occurrenceEntity.occurrenceSteps.map {
            it.occurrence = occurrenceEntity
        }
        occurrenceEntity.partOrder?.occurrence = occurrenceEntity
        occurrenceEntity.dealership = toOccurrenceDealershipEntity(occurrenceAddRequest, occurrenceEntity)
        occurrenceEntity.dealership?.occurrence = occurrenceEntity
        return occurrenceEntity
    }

    private fun dtcRequestToEntity(dtcRequest: DTCRequest): OccurrenceModuleEntity {
        return OccurrenceModuleEntity(
            name = dtcRequest.name,
            fmi = dtcRequest.fmi,
            spn = dtcRequest.spn
        )
    }

    fun booleanToYesNo(boolean: Boolean?): String? {
        return when(boolean) {
            true -> "y"
            false -> "n"
            null -> null
        }
    }

}

class OccurrenceAddRequest {

    @NotNull
    @Valid
    var vehicle: OccurrenceVehicleAddRequest? = null

    @NotNull
    @Valid
    var driver: OccurrenceDriverAddRequest? = null

    @NotNull
    @Valid
    var dealership:OccurrenceDealershipAddRequest? = null

    @Size(min = 0, max = 10000, message = "Limite de caracteres excedido")
    var observation:String? = null
    var status:String? = null

    @Min(1)
    @Max(5)
    var criticality:Int? = null

    var createdBy:String? = null
    var createdByUserProfileId:String? = null

    var expectedEndDate: LocalDateTime? = null
    var endDate: LocalDateTime? = null

    @Pattern(regexp = TimeUtils.DURATION_PATTERN, message = "Formato da duração inválida. Esperado hh:mm")
    var estimatedTime: String? = null

    @Valid
    @NotNull
    var dtcs:ArrayList<DTCRequest> = arrayListOf()

    var report:String? = null
    var stopped:Boolean? = null
    var occurrenceType:OccurrenceType? = null
    @Pattern(regexp = TimeUtils.DURATION_PATTERN, message = "Formato da duração inválida. Esperado hh:mm")
    var timeOpenProtocol:String? = null
    var requestingCountry:String? = null
    var hasLink:Boolean? = null
    var mainOccurrence:String? = null
    var origin:String? = null
    var payloadType:String? = null
    var loadWeight:Int? = null
    var criticalLoad:Boolean? = null
    var serviceBaySchedule:OccurrenceServiceBayScheduleRequest? = null
    var partnerId:String? = null
    var obs: String? = null
}

class OccurrenceVehicleAddRequest {


    var assetId:String? = null

    @NotNull
    var chassis:String? = null
    var model:String? = null

    var licencePlace:String? = null

    var vehicleType:String? = null

    var vehicleName:String? = null
    var vehicleYear:Int? = null
    var orderDate:LocalDate? = null
    var odometer:Int? = null
    var hourMeter:Int? = null
    var customer:String? = null
    var renter:String? = null
    var legislation:String? = null
}

class OccurrenceDriverAddRequest {


    var name:String? = null
    var driverLicenseNumber:String? = null
    var phone:String? = null
}

class OccurrenceDealershipAddRequest {

    var dn:String? = null
    var regional:String? = null
    var local:String? = null
    var representative:String? = null
    var cellNumber:String? = null
    var area:String? = null

}

class DTCRequest {
    var name:String? = null
    var spn:String? = null
    var fmi:Int? = null
}

enum class OccurrenceType(
    val type:String,
    val description:String,
) {
    PREVENTIVE("P", "Preventivo"),
    CORRECTIVE("C", "Corretivo"),
    PREVENTIVE_AND_CORRECTIVE("PC", "Preventivo e Corretivo"),
    ASSISTANCE("A", "Socorro"),
    WINCH("W", "Guincho"),
    IN_DEALERSHIP("D", "Na concessionária");

    companion object {
        @JvmStatic
        @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
        fun fromType(type: String): OccurrenceType {
            return entries.firstOrNull { it.type == type }
                ?: throw IllegalArgumentException("Unknown AssistanceOccurrenceType: $type")
        }
    }
}

class OccurrenceServiceBayScheduleRequest {

    @NotNull
    var startDate: LocalDateTime? = null
    @NotNull
    var endDate: LocalDateTime? = null
    @NotBlank
    var serviceBayId:String? = null
    var dn:String? = null
}

class Occurrence {
    lateinit var uuid:String
}

enum class StepTypeOccurrence(
    val description: String
) {

    TICKE("Chamado"),
    TRIAG("Triagem"),
    RELOC("Deslocamento"),
    DIAG2("2ª Diagnose"),
    REMOC("Remoção"),
    DIAG3("3ª Diagnose"),
    DIAG4("4ª Diagnose"),
    ANGAR("Analise garantia"),
    OKCLI("OK do cliente"),
    PARTS("Peças"),
    PARINTR("Peças em transito"),
    WAITREP("Aguardando reparo"),
    REPAIR("Reparo"),
    RELEASE("Liberação");

    var previous:StepTypeOccurrence? = null
    var next:StepTypeOccurrence? = null

    companion object {
        init {
            TICKE.next = TRIAG

            TRIAG.previous = TICKE
            TRIAG.next = RELOC

            RELOC.previous = TRIAG
            RELOC.next = DIAG2

            DIAG2.previous = RELOC
            DIAG2.next = REMOC

            REMOC.previous = DIAG2
            REMOC.next = DIAG3

            DIAG3.previous = REMOC
            DIAG3.next = DIAG4

            DIAG4.previous = DIAG3
            DIAG4.next = ANGAR

            ANGAR.previous = DIAG4
            ANGAR.next = OKCLI

            OKCLI.previous = ANGAR
            OKCLI.next = PARTS

            PARTS.previous = OKCLI
            PARTS.next = PARINTR

            PARINTR.previous = PARTS
            PARINTR.next = WAITREP

            WAITREP.previous = PARINTR
            WAITREP.next = REPAIR

            REPAIR.previous = WAITREP
            REPAIR.next = RELEASE

            RELEASE.previous = REPAIR
        }
    }
}