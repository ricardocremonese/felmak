package br.com.vw.uptime.schedule.core.converters

import br.com.vw.uptime.schedule.core.models.assistance.*
import br.com.vw.uptime.schedule.core.models.dealership.Dealership
import br.com.vw.uptime.schedule.entrypoint.requests.assistance.*
import br.com.vw.uptime.schedule.infrastructure.entities.assistance.*

class AssistanceConverter {

    companion object {
        fun fromEntityToAssistanceResponse(assistanceEntity: AssistanceEntity) : AssistanceResponse {
            return Mapping.copy(assistanceEntity, AssistanceResponse()).apply {
                this.assetId = assistanceEntity.towerAssetId
                this.occurType = assistanceEntity.occurType
                this.chassis = assistanceEntity.chassis
                this.vehicle = Mapping.copy(assistanceEntity.vehicle!!, VehicleAssistanceAddResponse())
                this.driver = Mapping.copy(assistanceEntity.driver!!, DriverAddResponse())
                this.occurrence = fromEntityToOccurrenceResponse(assistanceEntity.occurrence!!)
                this.dispatch = dispatchEntityToResponse(assistanceEntity)
            }
        }

        private fun dispatchEntityToResponse(assistanceEntity: AssistanceEntity): AssistanceDispatchResponse? {
            return assistanceEntity.dispatch?.let {
                AssistanceDispatchResponse().apply {
                    this.dealership = fromEntityToDealershipResponse(it.dealership)
                    this.vehicleLocation = vehicleLocationEntityToResponse(it.vehicleLocation)
                    this.steps = dispatchStepEntityToResponse(it.steps)
                    this.refund = AssistanceRefundResponse().apply {
                        this.protocolNumber = it.refund.protocolNumber
                        this.customer = it.refund.customer
                        this.city = it.vehicleLocation?.city!!
                        this.state = it.vehicleLocation?.state!!
                        this.releasePayment = it.refund.releasePayment
                        this.paidBy = it.refund.paidBy

                    }
                }
            }
        }

        private fun dispatchStepEntityToResponse(steps: List<DispatchStepEntity>?): List<DispatchStepResponse> {
            return steps?.map { Mapping.copy(it, DispatchStepResponse()) }?.toList() ?: emptyList()
        }

        private fun vehicleLocationEntityToResponse(vehicleLocation: VehicleLocationEntity?): VehicleLocationResponse? {
            return vehicleLocation?.let {
                Mapping.copy(it, VehicleLocationResponse())
            }
        }

        private fun fromEntityToDealershipResponse(dealership: DealershipAssistanceEntity?): DealershipAssistanceResponse? {
            return dealership?.let {
                DealershipAssistanceResponse().apply {
                    this.dealershipId = it.dealershipId
                    this.fantasyName = it.fantasyName
                    this.city = it.city
                    this.state = it.state
                }
            }
        }

        fun fromRequestToEntity(
            assistanceCreationRequest: AssistanceCreationRequest,
            dealership: Dealership?,
            refund: AssistanceRefundEntity,
            defaultSteps: List<DispatchStepEntity>
        ) : AssistanceEntity {
            return Mapping.copy(assistanceCreationRequest, AssistanceEntity()).apply {
                this.assetId = null /* This will be assigned on assignNewValuesToAssistance on AssistanceService */
                this.vehicle = Mapping.copy(assistanceCreationRequest.vehicle!!, VehicleAssistanceEntity())
                this.occurType = assistanceCreationRequest.occurType!!.type
                this.driver = Mapping.copy(assistanceCreationRequest.driver!!, DriverEntity())
                this.occurrence = fromRequestToOccurrenceEntity(assistanceCreationRequest.occurrence!!,OccurrenceEntity())
                val dispatchRequest = assistanceCreationRequest.dispatch

                if(dispatchRequest != null && dealership != null) {
                    this.dispatch = dispatchRequestToEntity(
                        dispatchRequest,
                        dealership,
                        refund,
                        defaultSteps
                    )
                }
            }
        }

        fun fromRequestUpdateToEntity(assistanceUpdateRequest: AssistanceUpdateRequest, assistanceEntity: AssistanceEntity): AssistanceEntity {
            val copiedEntityFromRoot = Mapping.copy(assistanceUpdateRequest, assistanceEntity)
            return copiedEntityFromRoot.apply {
                this.vehicle = assistanceUpdateRequest.vehicle?.let {
                    Mapping.copy(it, this.vehicle!!)
                }
                this.driver = assistanceUpdateRequest.driver?.let {
                    Mapping.copy(it, this.driver!!)
                }
                this.occurrence = assistanceUpdateRequest.occurrence?.let {
                    fromRequestToOccurrenceEntity(it, OccurrenceEntity())
                }
            }
        }

        fun dispatchRequestToEntity(dispatchRequest: AssistanceDispatchRequest, dealership: Dealership, refund:AssistanceRefundEntity, defaultSteps: List<DispatchStepEntity>): AssistanceDispatchEntity {
            return AssistanceDispatchEntity().apply {
                this.vehicleLocation = vehicleLocationRequestToEntity(dispatchRequest.vehicleLocation)
                this.dealership = fromDealershipToEntity(dealership)
                this.refund = refund
                this.steps = defaultSteps
            }
        }

        private fun vehicleLocationRequestToEntity(vehicleLocationRequest: VehicleLocationRequest?): VehicleLocationEntity? {
            return vehicleLocationRequest?.let { Mapping.copy(it, VehicleLocationEntity()) }
        }

        fun fromDealershipToEntity(dealership: Dealership) : DealershipAssistanceEntity {
            return DealershipAssistanceEntity().apply {
                this.dealershipId = dealership.id
                this.fantasyName = dealership.fantasyName
                this.city = dealership.city
                this.state = dealership.state
            }
        }

        fun fromRequestToOccurrenceEntity(occurrenceRequest: Occurrence, occurrenceEntity:OccurrenceEntity) : OccurrenceEntity {
            return Mapping.copy(occurrenceRequest, occurrenceEntity).apply {
                this.dtcs = occurrenceRequest.dtcs.map {
                    Mapping.copy(it, DTCEntity())
                }
            }
        }

        fun fromEntityToOccurrenceResponse(occurrenceEntity: OccurrenceEntity): OccurrenceAddResponse {
            return Mapping.copy(occurrenceEntity, OccurrenceAddResponse()).apply {
                this.dtcs = occurrenceEntity.dtcs.map {
                    Mapping.copy(it, DTCAddResponse())
                }
            }
        }

        fun historyEntityToResponse(assistanceHistoryEntity: AssistanceHistoryEntity): AssistanceHistoryResponse {
            return Mapping.copy(assistanceHistoryEntity, AssistanceHistoryResponse()).apply {
                userHistory = userHistoryEntityToResponse(assistanceHistoryEntity.userHistory)
            }
        }

        private fun userHistoryEntityToResponse(userHistoryEntity: UserHistoryEntity): UserHistoryResponse {
            return Mapping.copy(userHistoryEntity, UserHistoryResponse())
        }
    }
}