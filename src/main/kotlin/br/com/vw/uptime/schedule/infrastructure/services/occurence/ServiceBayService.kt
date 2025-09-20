package br.com.vw.uptime.schedule.infrastructure.services.occurence

import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.ServiceBayEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.dealerships.DealershipRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.ServiceBayRepository
import br.com.vw.uptime.schedule.infrastructure.services.user.ConsultantsServiceImpl
import jakarta.validation.constraints.NotBlank
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ServiceBayService(
    private val serviceBayRepository: ServiceBayRepository,
    private val consultantsServiceImpl: ConsultantsServiceImpl,
    private val dealershipRepository: DealershipRepository
) {


    @Transactional
    fun add(boxAddRequest: ServiceBayAddRequest, usr:UserAuthenticate): ServiceBayResponse {
        validateExistsByName(boxAddRequest.name!!)
        val serviceBayEntity = toServiceBayEntity(boxAddRequest, usr)
        val newEntity = serviceBayRepository.save(serviceBayEntity)
        return ServiceBayResponse(
            id = newEntity.id,
            name = newEntity.name
        )
    }

    @Transactional
    fun update(serviceBayId:String, boxUpdateRequest: ServiceBayUpdateRequest): ServiceBayResponse {
        val serviceBayEntity = validateExists(serviceBayId)
        validateExistsByNameUpdate(boxUpdateRequest.name!!, serviceBayId)
        serviceBayEntity.name = boxUpdateRequest.name!!.trim()
        serviceBayEntity.updatedAtToNow()
        val newEntity = serviceBayRepository.save(serviceBayEntity)
        return entityToResponse(newEntity)
    }

    @Transactional
    fun delete(serviceBayId:String): ServiceBayResponse {
        val serviceBayEntityOp = serviceBayRepository.findById(serviceBayId)
        if(serviceBayEntityOp.isEmpty) {
            throw BusinessException(
                ErrorCode.SERVICE_BAY_NOT_FOUND.toResponse()
            )
        }
        val serviceBayEntity = serviceBayEntityOp.get()
        serviceBayEntity.inactive()
        val newEntity = serviceBayRepository.save(serviceBayEntity)
        return ServiceBayResponse(
            id = newEntity.id,
            name = newEntity.name
        )
    }

    @Transactional(readOnly = true)
    fun list(usr: UserAuthenticate) : List<ServiceBayResponse> {
        val dn = getDnByUser(usr)
        val serviceBayListEntity = serviceBayRepository.findByDnAndActiveTrue(dn)
        return serviceBayListEntity.map {
            entityToResponse(it)
        }
    }

    private fun validateExistsByName(name:String) {
        if(serviceBayRepository.existsByNameIgnoreCaseAndActiveTrue(name.trim())) {
            throw BusinessException(
                ErrorCode.SERVICE_BAY_NAME_ALREADY_EXISTS.toResponse()
            )
        }
    }

    private fun validateExistsByNameUpdate(name:String, serviceBayId:String) {
        if(serviceBayRepository.existsByNameIgnoreCaseAndIdNot(name.trim(), serviceBayId)) {
            throw BusinessException(
                ErrorCode.SERVICE_BAY_NAME_ALREADY_EXISTS.toResponse()
            )
        }
    }

    private fun validateExists(serviceBayId:String) : ServiceBayEntity {
        val serviceBayEntityOp = serviceBayRepository.findById(serviceBayId)
        if(serviceBayEntityOp.isEmpty) {
            throw BusinessException(
                ErrorCode.SERVICE_BAY_NOT_FOUND.toResponse()
            )
        }
        return serviceBayEntityOp.get()
    }

    fun entityToResponse(serviceBayEntity: ServiceBayEntity) : ServiceBayResponse {
        return ServiceBayResponse(
            id = serviceBayEntity.id,
            name = serviceBayEntity.name
        )
    }

    private fun toServiceBayEntity(boxAddRequest: ServiceBayAddRequest, usr: UserAuthenticate): ServiceBayEntity {
        return ServiceBayEntity(
            name = boxAddRequest.name!!.trim(),
            dn = getDn(boxAddRequest,usr)
        )
    }

    private fun getDn(boxAddRequest: ServiceBayAddRequest,usr: UserAuthenticate): String {
        val dn = boxAddRequest.dn
        return if(dn != null) {
            checkIfExistsAndGet(dn)
        } else {
            getDnByUser(usr)
        }
    }

    private fun getDnByUser(usr: UserAuthenticate): String {
        val consultant = consultantsServiceImpl.consultantById(usr.userId)
        return consultant.dn
    }

    private fun checkIfExistsAndGet(dn: String): String {
        if(dealershipRepository.existsById(dn)) {
            return dn
        } else {
            throw BusinessException(
                ErrorCode.NO_DEALERSHIP_AVAILABLE.toResponse()
            )
        }
    }
}

class ServiceBayAddRequest {

    @NotBlank
    var name: String? = null
    var dn: String? = null
}

class ServiceBayUpdateRequest {

    @NotBlank
    var name: String? = null
}

data class ServiceBayResponse(
    var id:String = "",
    var name: String = ""
)