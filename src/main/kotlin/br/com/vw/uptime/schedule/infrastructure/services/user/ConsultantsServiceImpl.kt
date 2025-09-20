package br.com.vw.uptime.schedule.infrastructure.services.user

import br.com.vw.uptime.schedule.core.converters.Mapping
import br.com.vw.uptime.schedule.core.enums.checkups.CheckupScheduleState
import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.models.Page
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.infrastructure.entities.consultant.ConsultantEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.CheckupScheduleRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.consultants.ConsultantsRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.LocalDateTime

@Service
class ConsultantsServiceImpl(
    private val consultantsRepository:ConsultantsRepository,
    private val checkupScheduleRepository: CheckupScheduleRepository
) {

    fun firstAvailableConsultantByScheduledDate(startScheduledDate:LocalDateTime, dn:String) : Consultant {
        val consultantDataList = consultantsRepository.getConsultantsByDealershipId(dn)
        val consultantsAndDates = consultantDataList.map {
            consultantDataToConsultantAndDates(it, startScheduledDate.toLocalDate())
        }

        val firstConsultant = consultantsAndDates.firstOrNull {
            noConflictToList(it.scheduleDates, startScheduledDate)
        } ?: throw BusinessException(ErrorCode.NO_CONSULTANT_AVAILABLE.toResponse())
        return firstConsultant.consultant
    }

    fun noConflictToList(dates:List<LocalDateTime>, startScheduledDate: LocalDateTime) : Boolean {
        val endScheduledDate = startScheduledDate.plusMinutes(30)
        return if(dates.isEmpty())
            true
        else {
            val hasConflict = dates.any { startHour ->
                val endHour = startHour.plusMinutes(30)
                hasConflict(startScheduledDate, endScheduledDate, startHour, endHour)
            }
            !hasConflict
        }
    }

    fun consultantsCheckups(dateDay:LocalDate, dn:String) : List<ConsultantAndDates> {
        val consultantDataList = consultantsRepository.getConsultantsByDealershipId(dn)
        return consultantDataList.map { conData ->
            consultantDataToConsultantAndDates(conData, dateDay)
        }
    }

    fun getAllConsultantsWithPagination(page: Int = 0, limit: Int = 20): Page<Consultant> {
        val offset = page * limit
        val allConsultants = consultantsRepository.getAllConsultants()
        
        val totalCount = allConsultants.size
        val paginatedConsultants = allConsultants.drop(offset).take(limit)
        
        val consultants = paginatedConsultants.map { consultantDataToConsultant(it) }
        
        return Page(
            items = consultants,
            lastKey = if (offset + limit < totalCount) (page + 1).toString() else null
        )
    }

    fun consultantById(consultantId:String) : Consultant {
        return consultantsRepository.consultantById(consultantId)?.let {
            consultantDataToConsultant(it)
        } ?: throw BusinessException(ErrorCode.NO_CONSULTANT_FOUND.toResponse())
    }

    fun consultantByIdAvailable(consultantId:String, dateToSchedule:LocalDateTime) : Consultant {
        val consultantData = consultantsRepository.consultantById(consultantId)
            ?: throw BusinessException(ErrorCode.NO_CONSULTANT_FOUND.toResponse())
        val consultantAndDates = consultantDataToConsultantAndDates(consultantData, dateToSchedule.toLocalDate())
        if(!noConflictToList(consultantAndDates.scheduleDates, dateToSchedule)) {
            throw BusinessException(ErrorCode.NO_CONSULTANT_AVAILABLE.toResponse())
        }
        return consultantAndDates.consultant
    }

    fun getConsultantOrDealershipAvailable(consultantId:String?, dealershipId:String, dateToSchedule: LocalDateTime) : Consultant {
        if(consultantId != null) {
            return consultantByIdAvailable(consultantId, dateToSchedule)
        }
        val consultant = firstAvailableConsultantByScheduledDate(
            dateToSchedule,
            dealershipId
        )
        return consultant
    }

    fun hasConflict(start1:LocalDateTime, end1:LocalDateTime, start2:LocalDateTime, end2:LocalDateTime) : Boolean {
        return start1 < end2 && start2 < end1
    }

    fun consultantDataToConsultantAndDates(conData:ConsultantEntity, dateDay:LocalDate): ConsultantAndDates {
        val startOfDay = dateDay.atStartOfDay()
        val endOfDay = dateDay.atTime(23, 59, 59, 999_000_000)
        val checkupSchedules = checkupScheduleRepository.checkupScheduleByDateAndConsultantAndState(
            startOfDay,
            endOfDay,
            conData.dn,
            conData.id,
            CheckupScheduleState.PENDING
        )
        return ConsultantAndDates(
            consultantDataToConsultant(conData),
            checkupSchedules.map {
                it.schedule.scheduledDate
            }
        )
    }

    fun consultantDataToConsultant(conData: ConsultantEntity) : Consultant {
        return Consultant(
            conData.id,
            conData.dn,
            conData.accountId,
            conData.firstName,
            conData.lastName,
            conData.email ?: "",
            conData.phoneNumber ?: ""
        )
    }

    fun consultantToConsultantEntity(consultant: Consultant) : ConsultantEntity {
        return Mapping.copy(consultant, ConsultantEntity())
    }

    fun changeConsultant(consultant: Consultant): Consultant {
        val savedConsultantEntity = consultantsRepository.saveOrUpdateConsultant(
            consultantToConsultantEntity(consultant)
        )
        return consultantDataToConsultant(savedConsultantEntity)
    }

    fun deleteConsultant(consultantId: String): Boolean {
        val consultant = consultantsRepository.consultantById(consultantId)
            ?: throw BusinessException(ErrorCode.NO_CONSULTANT_FOUND.toResponse())
        
        return consultantsRepository.deleteConsultant(consultantId)
    }
}

data class ConsultantAndDates (
    val consultant:Consultant,
    val scheduleDates:List<LocalDateTime>
)

data class Consultant (
    val id: String,
    val dn: String,
    val accountId:String,
    val firstName: String,
    val lastName: String,
    val email: String?,
    val phoneNumber: String?,
)