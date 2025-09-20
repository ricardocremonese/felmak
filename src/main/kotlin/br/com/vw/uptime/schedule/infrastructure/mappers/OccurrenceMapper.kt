package br.com.vw.uptime.schedule.infrastructure.mappers

import br.com.vw.uptime.schedule.core.utils.TimeUtils
import br.com.vw.uptime.schedule.entrypoint.responses.occurrence.*
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.DispatchEntity
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.Failure
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.OccurrenceEntity
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.PartOrder
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.PartOrderDeliveryDates
import br.com.vw.uptime.schedule.infrastructure.services.occurence.OccurrenceType
import org.springframework.stereotype.Component

@Component
class OccurrenceMapper {
    fun toResponse(entity: OccurrenceEntity): OccurrenceResponse {
        return OccurrenceResponse(
            uuid = entity.uuid,
            accountUuid = entity.accountUuid,
            currentStep = entity.currentStep.name,
            criticality = entity.criticality,
            osNumber = entity.osNumber,
            osDtOpenAt = entity.osDtOpenAt,
            renter = entity.renter,
            createdBy = entity.createdBy,
            createdByUuid = entity.createdByUuid,
            createdByUserProfileId = entity.createdByUserProfileId,
            literatureTroubleshooting = entity.literatureTroubleshooting,
            country = entity.country,
            occurrenceType = entity.occurrenceType,
            hasCampaigns = entity.hasCampaigns,
            tasNumber = entity.tasNumber,
            tasStatus = entity.tasStatus,
            timeOpenProtocol = entity.timeOpenProtocol?.let {
                TimeUtils.minutesToDurationString(it)
            },
            source = entity.source,
            hasLink = entity.hasLink,
            mainOccurrence = entity.mainOccurrence,
            estimateTimeRepair = entity.estimateTimeRepair?.let { TimeUtils.minutesToDurationString(it) },
            solutionProposed = entity.solutionProposed,
            mechanicLocation = entity.mechanicLocation,
            towTruckLocation = entity.towTruckLocation,
            checklist = entity.checklist,
            customer = entity.customer,
            updatedAt = entity.updatedAt,
            createdAt = entity.createdAt,
            protocolNumber = if(entity.scheduleUuid == null) entity.protocolNumber else null,
            scheduleNumber = if(entity.scheduleUuid != null) entity.protocolNumber else null,
            scheduleUuid = entity.scheduleUuid,
            partnerId = entity.partnerId,
            observation = entity.observation,
            status = entity.status,
            driver = entity.driver?.let { driver ->
                DriverResponse(
                    name = driver.name,
                    driverLicenseNumber = driver.driverLicenseNumber,
                    phone = driver.phone,
                    checkInDriver = driver.checkInDriver
                )
            },
            vehicle = entity.vehicle?.let { vehicle ->
                VehicleResponse(
                    chassis = vehicle.chassis,
                    model = vehicle.model,
                    licensePlate = vehicle.licensePlate,
                    vehicleType = vehicle.vehicleType,
                    name = vehicle.name,
                    vehicleYear = vehicle.vehicleYear,
                    odometer = vehicle.odometer,
                    hourMeter = vehicle.hourMeter,
                    payloadType = vehicle.payloadType,
                    maximumPayload = vehicle.maximumPayload,
                    criticalPayload = yesNoToBoolean(vehicle.criticalPayload),
                    stopped = yesNoToBoolean(vehicle.stopped),
                    emissionStandard = vehicle.emissionStandard
                )
            },
            dtcs = entity.dtcs.map { dtc ->
                DTCResponse(
                    name = dtc.name ?: "",
                    spn = dtc.spn ?: "",
                    fmi = dtc.fmi ?: 0
                )
            },
            occurrenceSteps = entity.occurrenceSteps.map { step ->
                OccurrenceStepDetailResponse(
                    id = step.id,
                    stepId = step.stepId.name,
                    report = step.report,
                    observation = step.observation,
                    dtStart = step.dtStart,
                    expectedDtEnd = step.expectedDtEnd,
                    dtEnd = step.dtEnd,
                    latest = step.latest,
                    estimatedTime = step.estimatedTime?.let {
                        TimeUtils.minutesToDurationString(it)
                    },
                    updatedBy = step.updatedBy,
                    updatedByUuid = step.updatedByUuid,
                    updatedAt = step.updatedAt
                )
            },
            dealership = entity.dealership?.let { dealership ->
                DealershipResponse(
                    dn = dealership.dn,
                    regional = dealership.regional,
                    local = dealership.local,
                    representative = dealership.representative,
                    cellNumber = dealership.cellNumber,
                    area = dealership.area,
                    name = dealership.dealership?.fantasyName
                )
            },
            partOrder = entity.partOrder?.let { partOrder ->
                PartOrderResponse(
                    dtOrder = partOrder.dtOrder,
                    dtEstimate = partOrder.dtEstimate,
                    dtDeliveryEstimate = partOrder.dtDeliveryEstimate,
                    status = partOrder.status,
                    orderNumber = partOrder.orderNumber,
                    statusOrder = partOrder.statusOrder,
                    occurrenceParts = partOrder.occurrenceParts.map { part ->
                        PartResponse(
                            partNumber = part.partNumber,
                            quantity = part.quantity
                        )
                    }
                )
            },
            dispatches = entity.dispatches.map { dispatch ->
                OccurrenceDispatchResponse(
                    uuid = dispatch.dispatchUuid,
                    authorizePayment = dispatch.authorizePayment,
                    reasonRefusal = dispatch.reasonRefusal?.name,
                    descriptionRefusal = dispatch.descriptionRefusal,
                    payer = dispatch.payer,
                    type = dispatch.occurrenceType?.description,
                    status = dispatch.status?.description,
                    route = dispatch.route,
                    dn = dispatch.dn,
                    driver = dispatch.driver
                )
            },
            serviceBaySchedule = entity.serviceBaySchedule.firstOrNull()?.let { sbs ->
                ServiceBayScheduleResponse(
                    id = sbs.id,
                    startDate = sbs.startDate,
                    endDate = sbs.endDate,
                    dn = sbs.dn,
                    createdAt = sbs.createdAt,
                    updatedAt = sbs.updatedAt,
                    active = sbs.active,
                    createdBy = sbs.createdBy,
                    createdById = sbs.createdById,
                    serviceBay = sbs.serviceBay?.let { sb ->
                        ServiceBayResponse(
                            id = sb.id,
                            name = sb.name,
                            dn = sb.dn,
                            createdAt = sb.createdAt,
                            updatedAt = sb.updatedAt,
                            active = sb.active
                        )
                    }
                )
            },
            failures = entity.failures?.let { failuresJson ->
                try {
                    val objectMapper = com.fasterxml.jackson.databind.ObjectMapper()
                    objectMapper.readValue(failuresJson, object : com.fasterxml.jackson.core.type.TypeReference<List<Failure>>() {})
                } catch (e: Exception) {
                    emptyList<Failure>()
                }
            } ?: emptyList(),
            partOrders = entity.partOrders?.let { partOrdersJson ->
                try {
                    val objectMapper = com.fasterxml.jackson.databind.ObjectMapper()
                    objectMapper.readValue(partOrdersJson, object: com.fasterxml.jackson.core.type.TypeReference<List<PartOrder>>() {})
                } catch (e: Exception) {
                    emptyList<PartOrder>()
                }
            } ?: emptyList(),
            partOrderDeliveryDates = entity.partOrderDeliveryDates?.let { partOrderDeliveryDatesJson ->
                try {
                    val objectMapper = com.fasterxml.jackson.databind.ObjectMapper()
                    objectMapper.readValue(partOrderDeliveryDatesJson, object: com.fasterxml.jackson.core.type.TypeReference<List<PartOrderDeliveryDates>>() {})
                } catch (e: Exception) {
                    emptyList<PartOrderDeliveryDates>()
                }
            } ?: emptyList(),
            finished = entity.endDate != null,
            finalizationReasonType = entity.finalizationReasonType?.name,
            finalizationReasonDescription = entity.finalizationReasonDescription
        )
    }

    fun yesNoToBoolean(yesNo:String?) : Boolean? {
        return when(yesNo) {
            "y" -> true
            "n" -> false
            else -> null
        }
    }

    fun toDispatchResponse(entity: DispatchEntity): OccurrenceDispatchResponse {
        return OccurrenceDispatchResponse(
            uuid = entity.dispatchUuid,
            authorizePayment = entity.authorizePayment,
            reasonRefusal = entity.reasonRefusal?.name,
            descriptionRefusal = entity.descriptionRefusal,
            payer = entity.payer,
            type = entity.occurrenceType?.description,
            status = entity.status?.description,
            route = entity.route,
            dn = entity.dn,
            driver = entity.driver
        )
    }
} 