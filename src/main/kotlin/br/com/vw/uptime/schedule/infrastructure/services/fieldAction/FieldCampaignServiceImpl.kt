package br.com.vw.uptime.schedule.infrastructure.services.fieldAction

import br.com.vw.uptime.schedule.core.converters.FieldCampaignConverter
import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.infrastructure.repositories.fieldAction.FieldCampaignRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate

@Service
class FieldCampaignServiceImpl(
    val fieldCampaignRepository: FieldCampaignRepository
) {

    fun fieldActionByNumber(chassis:String, number:String) : Campaign? {
        val fieldCampaignEntity = fieldCampaignRepository.getCampaignByChassisAndNumber(chassis, number)
        if(fieldCampaignEntity == null) {
            throw BusinessException(
                ErrorCode.FIELD_CAMPAIGN_FOUND.toResponse()
            )
        }
        return FieldCampaignConverter.campaignChildEntityToCampaign(fieldCampaignEntity)
    }

    fun pendingFieldActionListByChassis(chassis:String) : List<Campaign> {
        val fieldCampaignEntityList = fieldCampaignRepository.getPendingCampaignByChassis(chassis)
        return fieldCampaignEntityList.map {
            FieldCampaignConverter.campaignChildEntityToCampaign(it)
        }
    }

}

class Campaign {

    lateinit var number:String
    lateinit var name:String
    lateinit var validityFrom:LocalDate
    lateinit var validityUntil:LocalDate
    lateinit var classification:String
    lateinit var averagePrice:BigDecimal
    lateinit var campaignYear:String
    lateinit var campaignStatus:String
    lateinit var dn: String
    var vehicle: String? = null
    var repairDate: LocalDate? = null
    lateinit var repairStatus:String
}