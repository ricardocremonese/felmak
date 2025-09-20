package br.com.vw.uptime.schedule.infrastructure.services.occurence

import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.OccurrenceEntity
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.ServiceBayEntity
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.ServiceBayScheduleEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.ServiceBayRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.ServiceBayScheduleRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.users.User
import br.com.vw.uptime.schedule.infrastructure.services.user.ConsultantsServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.user.UsersServiceImpl
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime


@Service
class ServiceBayScheduleService(
    private val serviceBayScheduleRepository: ServiceBayScheduleRepository,
    private val occurrenceService: OccurrenceService,
    private val serviceBayRepository: ServiceBayRepository,
    private val consultantsServiceImpl: ConsultantsServiceImpl,
    private val usersServiceImpl: UsersServiceImpl
) {

    @Transactional
    fun add(request: ServiceBayScheduleRequest, usr: UserAuthenticate, userParam:User? = null, occurrenceEntityParam: OccurrenceEntity? = null) : ServiceBayScheduleResponse {
        val dn = getDn(request, usr)
        val user = userParam ?: usersServiceImpl.getUserById(usr.userId)
        validateServiceBayAddRequest(request)
        val occurrenceEntity = occurrenceEntityParam?: validateOccurrenceExists(request)
        val serviceBayEntity = validateServiceBayExists(request, dn)
        validateConflict(request, dn, occurrenceEntity.id!!)
        val serviceBayScheduleEntity = toScheduleEntity(request, dn, user).apply {
            this.occurrence = occurrenceEntity
            this.serviceBay = serviceBayEntity
        }
        return entityToResponse(serviceBayScheduleRepository.save(serviceBayScheduleEntity))
    }

    private fun getDn(request: ServiceBayScheduleRequest, usr: UserAuthenticate): String {
        return request.dn ?: getDnByUser(usr)
    }

    @Transactional(readOnly = true)
    fun list(startDate: LocalDateTime, endDate: LocalDateTime, usr: UserAuthenticate, serviceBayIds:List<String>) : List<ServiceBayScheduleResponseList> {

        val list = if(serviceBayIds.isNotEmpty()) {
            serviceBayScheduleRepository.findByRangeDatesWithServiceBays(
                startDate = startDate,
                endDate = endDate,
                dn = getDnByUser(usr),
                serviceBayIds
            )
        } else {
            serviceBayScheduleRepository.findByRangeDates(
                startDate = startDate,
                endDate = endDate,
                dn = getDnByUser(usr)
            )
        }
        return list.map {
            toServiceBayScheduleResponseList(it)
        }
    }

    @Transactional
    fun cancel(serviceBayScheduleId:String, usr: UserAuthenticate): ServiceBayScheduleResponse {
        val serviceBayScheduleEntity = validateServiceBayScheduleExists(serviceBayScheduleId, usr)
        serviceBayScheduleEntity.inactive()
        val updatedEntity = serviceBayScheduleRepository.save(serviceBayScheduleEntity)
        return entityToResponse(updatedEntity)
    }

    @Transactional
    fun getByOccurrenceId(occurrenceId:String, usr: UserAuthenticate): ServiceBayScheduleResponse {
        val serviceBayScheduleEntity = serviceBayScheduleRepository.findByDnAndActive(getDnByUser(usr))
        val serviceBaySchedule = serviceBayScheduleEntity.find { it.occurrence?.uuid == occurrenceId }
        if(serviceBaySchedule == null) {
            throw BusinessException(
                ErrorCode.SERVICE_BAY_SCHEDULE_NOT_FOUND.toResponse()
            )
        }
        return entityToResponse(serviceBaySchedule)
    }

    private fun entityToResponse(serviceBayScheduleEntity:ServiceBayScheduleEntity): ServiceBayScheduleResponse {
        return ServiceBayScheduleResponse().apply {
            this.id = serviceBayScheduleEntity.id
            this.startDate = serviceBayScheduleEntity.startDate
            this.endDate = serviceBayScheduleEntity.endDate
            this.occurrenceUuid = serviceBayScheduleEntity.occurrence?.uuid
            this.serviceBayId = serviceBayScheduleEntity.serviceBay?.id
        }
    }

    private fun validateServiceBayScheduleExists(serviceBayScheduleId:String, usr:UserAuthenticate): ServiceBayScheduleEntity {
        val serviceBayScheduleEntity = serviceBayScheduleRepository.findByIdAndDnAndActive(serviceBayScheduleId, getDnByUser(usr), true)
        if(serviceBayScheduleEntity == null) {
            throw BusinessException(
                ErrorCode.SERVICE_BAY_SCHEDULE_NOT_FOUND.toResponse()
            )
        }
        return serviceBayScheduleEntity
    }

    private fun getDnByUser(usr: UserAuthenticate): String {
        val consultant = consultantsServiceImpl.consultantById(usr.userId)
        return consultant.dn
    }

    private fun validateConflict(request: ServiceBayScheduleRequest, dn:String, occurrenceId:Int) {
        val hasConflict = serviceBayScheduleRepository.hasConflict(
            serviceBayId = request.serviceBayId!!,
            start = request.startDate!!,
            end = request.endDate!!
        )
        if(hasConflict) {
            throw BusinessException(
                ErrorCode.SERVICE_BAY_SCHEDULE_CONFLICT.toResponse()
            )
        }
        val existsBoxTheOccurrenceId = serviceBayScheduleRepository.existsByOccurrenceIdAndDnAndActive(
            idOccurrence = occurrenceId,
            dn = dn,
            active = true
        )
        if(existsBoxTheOccurrenceId) {
            throw BusinessException(
                ErrorCode.SERVICE_BAY_WITH_OCCURRENCE_EXISTS.toResponse()
            )
        }
    }

    private fun toScheduleEntity(request: ServiceBayScheduleRequest, dn: String, user: User): ServiceBayScheduleEntity {
        return ServiceBayScheduleEntity(
            startDate = request.startDate,
            endDate = request.endDate,
            dn = dn,
            createdBy = user.firstName + " " + user.lastName,
            createdById = user.id,
            createdAt = LocalDateTime.now()
        )
    }

    private fun validateServiceBayExists(request: ServiceBayScheduleRequest, dn:String): ServiceBayEntity {
        val serviceBayEntity = serviceBayRepository.findOneByIdAndDnAndActiveTrue(request.serviceBayId!!, dn)
        if(serviceBayEntity.isEmpty) {
            throw BusinessException(
                ErrorCode.SERVICE_BAY_NOT_FOUND.toResponse()
            )
        }
        return serviceBayEntity.get()
    }

    private fun validateOccurrenceExists(request: ServiceBayScheduleRequest) : OccurrenceEntity {
        return occurrenceService.getOccurrence(request.occurrenceUuid!!)
    }

    private fun validateServiceBayAddRequest(request: ServiceBayScheduleRequest) {
        if(request.startDate!! >= request.endDate!!) {
            throw BusinessException(
                ErrorCode.START_DATE_MUST_BE_BEFORE_END_DATE.toResponse()
            )
        }
    }

    private fun toServiceBayScheduleResponseList(serviceBayScheduleEntity: ServiceBayScheduleEntity): ServiceBayScheduleResponseList {
        val serviceBay = serviceBayScheduleEntity.serviceBay
        val occurrence = serviceBayScheduleEntity.occurrence
        val vehicle = occurrence?.vehicle!!
        return ServiceBayScheduleResponseList().apply {
            this.id = serviceBayScheduleEntity.id
            this.startDate = serviceBayScheduleEntity.startDate
            this.endDate = serviceBayScheduleEntity.endDate
            this.serviceBay = ServiceBayResponse(
                id = serviceBay?.id!!,
                name = serviceBay.name
            )
            this.occurrence = OccurrenceListResponse().apply {
                this.uuid = occurrence.uuid
                this.isFinished = occurrence.endDate != null
                this.vehicle = OccurrenceVehicleResponseList().apply {
                    this.chassis =vehicle.chassis
                    this.name = vehicle.name
                }
            }
        }
    }
}

class ServiceBayScheduleRequest {

    @NotNull
    var startDate: LocalDateTime? = null
    @NotNull
    var endDate: LocalDateTime? = null
    @NotBlank
    var occurrenceUuid:String? = null
    @NotBlank
    var serviceBayId:String? = null
    var dn:String? = null
}

class ServiceBayScheduleResponse {
    var id:String? = null
    var startDate: LocalDateTime? = null
    var endDate: LocalDateTime? = null
    var occurrenceUuid:String? = null
    var serviceBayId:String? = null
}

class ServiceBayScheduleResponseList {
    var id:String? = null
    var startDate: LocalDateTime? = null
    var endDate: LocalDateTime? = null
    var serviceBay:ServiceBayResponse? = null
    var occurrence:OccurrenceListResponse? = null
}

class OccurrenceListResponse {
    var uuid:String? = null
    var vehicle:OccurrenceVehicleResponseList? = null
    var isFinished:Boolean? = null
}

class OccurrenceVehicleResponseList {
    var chassis: String? = null
    var name: String? = null
}