package br.com.vw.uptime.schedule.infrastructure.services.occurence

import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.utils.TimeUtils
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.entrypoint.requests.occurrence.*
import br.com.vw.uptime.schedule.entrypoint.responses.occurrence.OccurrenceResponse
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.*
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.PartOrderDeliveryDates
import br.com.vw.uptime.schedule.infrastructure.mappers.OccurrenceMapper
import br.com.vw.uptime.schedule.infrastructure.repositories.dealerships.DealershipRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.OccurrenceRepository
import br.com.vw.uptime.schedule.infrastructure.services.user.*
import br.com.vw.uptime.schedule.infrastructure.repositories.users.User
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class OccurrenceUpdateService(
    private val occurrenceRepository: OccurrenceRepository,
    private val dealershipRepository: DealershipRepository,
    private val usersServiceImpl: UsersServiceImpl,
    private val occurrenceMapper: OccurrenceMapper
) {

    @Transactional(readOnly = false)
    fun update(occurrenceUuid:String, occurrenceUpdateRequest: OccurrenceUpdateRequest, usr: UserAuthenticate): OccurrenceResponse {
        val occurrenceEntity = occurrenceRepository.getOccurrenceByUuid(occurrenceUuid)
        validateOccurrence(occurrenceEntity)
        validateDealership(occurrenceUpdateRequest)
        val user = usersServiceImpl.getUserById(userId = usr.userId)
        mapOccurrenceEntity(occurrenceEntity!!, occurrenceUpdateRequest, user)
        occurrenceRepository.save(occurrenceEntity)
        return occurrenceMapper.toResponse(occurrenceEntity)
    }

    private fun validateOccurrence(occurrenceEntity: OccurrenceEntity?) {
        if(occurrenceEntity == null) {
            throw BusinessException(
                ErrorCode.OCCURRENCE_NOT_FOUND.toResponse()
            )
        }
    }

    private fun validateDealership(updateRequest: OccurrenceUpdateRequest) {
        updateRequest.dealership?.dn?.let {
            if(dealershipRepository.findByDn(it) == null)  {
                throw BusinessException(
                    ErrorCode.NO_DEALERSHIP_AVAILABLE.toResponse()
                )
            }
        }
    }

    private fun updateLastStep(occurrenceStepEntityList:List<OccurrenceStepEntity>, occurrenceStepRequest: OccurrenceStepUpdateRequest, user: User) {
        val lastStep = occurrenceStepEntityList.maxByOrNull {
            it.latest
        }
        lastStep?.let { lastStepEntity ->
            lastStepEntity.report = occurrenceStepRequest.report
            lastStepEntity.estimatedTime = occurrenceStepRequest.estimatedTime?.let {
                TimeUtils.durationToTotalMinutes(it)
            }
            lastStepEntity.observation = occurrenceStepRequest.observation
            lastStepEntity.expectedDtEnd = occurrenceStepRequest.expectedEndDate
            lastStepEntity.updatedBy = user.firstName + " " + user.lastName
            lastStepEntity.updatedByUuid = user.accountId
            lastStepEntity.updatedAt = LocalDateTime.now()
        }
    }

    fun mapOccurrenceEntity(occurrenceEntity:OccurrenceEntity, request: OccurrenceUpdateRequest, user: User): OccurrenceEntity {
        val driverRequest = request.driver
        occurrenceEntity.updatedAt = LocalDateTime.now()
        occurrenceEntity.criticality = request.criticality
        occurrenceEntity.osNumber = request.osNumber
        occurrenceEntity.osDtOpenAt = request.osDtOpenAt
        occurrenceEntity.renter = request.renter
        occurrenceEntity.literatureTroubleshooting = request.literatureTroubleshooting
        occurrenceEntity.country = request.country
        occurrenceEntity.occurrenceType = request.occurrenceType?.type
        occurrenceEntity.tasNumber = request.tasNumber
        occurrenceEntity.tasStatus = request.tasStatus
        occurrenceEntity.timeOpenProtocol = request.timeOpenProtocol?.let {
            TimeUtils.durationToTotalMinutes(it)
        }
        occurrenceEntity.source = request.source
        occurrenceEntity.observation = request.observation
        occurrenceEntity.status = request.status
        occurrenceEntity.hasLink = request.hasLink
        occurrenceEntity.mainOccurrence = request.mainOccurrence
        occurrenceEntity.estimateTimeRepair = request.estimateTimeRepair?.let {
            TimeUtils.durationToTotalMinutes(it)
        }
        occurrenceEntity.solutionProposed = request.solutionProposed
        occurrenceEntity.mechanicLocation = request.mechanicLocation
        occurrenceEntity.towTruckLocation = request.towTruckLocation
        occurrenceEntity.checklist = request.checklist
        occurrenceEntity.customer = request.customer
        occurrenceEntity.partnerId = request.partnerId
        occurrenceEntity.driver?.apply {
            driverRequest?.let { driverReq ->
                this.name = driverReq.name
                this.phone = driverReq.phone
                this.driverLicenseNumber = driverReq.driverLicenseNumber
                this.checkInDriver = driverReq.checkInDriver
            }
        }
        occurrenceEntity.vehicle?.let {
            request.vehicle?.let { requestVehicle ->
                mapOccurrenceVehicleUpdateRequest(requestVehicle, it)
            }
        }
        occurrenceEntity.dtcs.let { dtcEntityList ->
            val dtcReqList = request.dtcs
            dtcEntityList.clear()
            dtcReqList?.forEach { dtcReq ->
                dtcEntityList.add(OccurrenceModuleEntity().apply {
                    this.occurrence = occurrenceEntity
                    this.name = dtcReq.name
                    this.spn = dtcReq.spn
                    this.fmi = dtcReq.fmi
                })
            }
        }
        occurrenceEntity.occurrenceSteps.apply {
            request.occurrenceStep?.let {
                updateLastStep(this, it, user)
            }
        }
        occurrenceEntity.dealership?.let { entity ->
            request.dealership?.let { dealershipReq ->
                mapOccurrenceDealershipUpdateRequest(dealershipReq, entity)
            }
        }
        request.partsOrder?.let { partReq ->
            val partOrderEntity = occurrenceEntity.partOrder
            if(partOrderEntity == null) {
                occurrenceEntity.partOrder = OccurrencePartOrderEntity(
                    occurrence = occurrenceEntity
                )
            }
            mapOccurrencePartOrderRequest(partReq, occurrenceEntity.partOrder!!)
        }
        request.failures?.let { failuresReq: List<Failure> ->
            val objectMapper = com.fasterxml.jackson.databind.ObjectMapper()
            occurrenceEntity.failures = objectMapper.writeValueAsString(failuresReq)
        }
        request.partOrders?.let { partOrdersReq: List<PartOrder> ->
            val objectMapper = com.fasterxml.jackson.databind.ObjectMapper()
            occurrenceEntity.partOrders = objectMapper.writeValueAsString(partOrdersReq)
        }
        request.partOrderDeliveryDates?.let { partOrderDeliveryDatesReq: List<PartOrderDeliveryDates> ->
            val objectMapper = com.fasterxml.jackson.databind.ObjectMapper()
            occurrenceEntity.partOrderDeliveryDates = objectMapper.writeValueAsString(partOrderDeliveryDatesReq)
        }
        return occurrenceEntity
    }

    fun mapOccurrenceDealershipUpdateRequest(occurrenceDealershipUpdateRequest: OccurrenceDealershipUpdateRequest, occurrenceDealershipEntity: OccurrenceDealershipEntity): OccurrenceDealershipEntity {
        occurrenceDealershipEntity.dn = occurrenceDealershipUpdateRequest.dn
        occurrenceDealershipEntity.regional = occurrenceDealershipUpdateRequest.regional
        occurrenceDealershipEntity.cellNumber = occurrenceDealershipUpdateRequest.cellNumber
        occurrenceDealershipEntity.area = occurrenceDealershipUpdateRequest.area
        occurrenceDealershipEntity.local = occurrenceDealershipUpdateRequest.local
        occurrenceDealershipEntity.representative = occurrenceDealershipUpdateRequest.representative
        return occurrenceDealershipEntity
    }

    fun mapOccurrenceVehicleUpdateRequest(request: OccurrenceVehicleUpdateRequest, occurrenceVehicleEntity:OccurrenceVehicleEntity): OccurrenceVehicleEntity {

        occurrenceVehicleEntity.chassis = request.chassis
        occurrenceVehicleEntity.model = request.model
        occurrenceVehicleEntity.licensePlate = request.licensePlate
        occurrenceVehicleEntity.vehicleType = request.vehicleType
        occurrenceVehicleEntity.name = request.name
        occurrenceVehicleEntity.vehicleYear = request.vehicleYear
        occurrenceVehicleEntity.odometer = request.odometer
        occurrenceVehicleEntity.hourMeter = request.hourMeter
        occurrenceVehicleEntity.payloadType = request.payloadType
        occurrenceVehicleEntity.maximumPayload = request.maximumPayload
        occurrenceVehicleEntity.criticalPayload = booleanToYesNo(request.criticalPayload)
        occurrenceVehicleEntity.stopped = booleanToYesNo(request.stopped)
        occurrenceVehicleEntity.emissionStandard = request.emissionStandard
        return occurrenceVehicleEntity
    }

    fun mapOccurrencePartOrderRequest(request: OccurrencePartOrderUpdateRequest, occurrencePartOrderEntity: OccurrencePartOrderEntity) {
        occurrencePartOrderEntity.dtOrder = request.dtOrder
        occurrencePartOrderEntity.dtEstimate = request.dtEstimate
        occurrencePartOrderEntity.dtDeliveryEstimate = request.dtDeliveryEstimate
        occurrencePartOrderEntity.status = request.status
        occurrencePartOrderEntity.orderNumber = request.orderNumber
        occurrencePartOrderEntity.statusOrder = request.statusOrder
        occurrencePartOrderEntity.occurrenceParts.let { occPartsEntity ->
            occPartsEntity.clear()
            request.occurrenceParts?.forEach { occPartsReq ->
                occPartsEntity.add(
                    OccurrencePartEntity(
                        partOrder = occurrencePartOrderEntity,
                        partNumber = occPartsReq.partNumber,
                        quantity = occPartsReq.quantity ?: 0
                    )
                )
            }
        }
    }

    fun booleanToYesNo(boolean: Boolean?): String? {
        return when(boolean) {
            true -> "y"
            false -> "n"
            null -> null
        }
    }

}