package br.com.vw.uptime.schedule.core.converters

import br.com.vw.uptime.schedule.infrastructure.entities.checkup.ConsultantScheduleChild
import br.com.vw.uptime.schedule.infrastructure.services.user.Consultant

class ConsultantConverter {

    companion object {
        fun consultantEntityToConsultant(consultantEntity: ConsultantScheduleChild): Consultant {
            return Consultant(
                consultantEntity.id,
                consultantEntity.dn,
                consultantEntity.accountId,
                consultantEntity.firstName,
                consultantEntity.lastName,
                consultantEntity.email,
                consultantEntity.phoneNumber
            )
        }

        fun consultantToEntity(consultant:Consultant) : ConsultantScheduleChild {
            return Mapping.copy(consultant, ConsultantScheduleChild())
        }
    }
}