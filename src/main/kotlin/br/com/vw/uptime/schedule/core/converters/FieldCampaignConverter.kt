package br.com.vw.uptime.schedule.core.converters

import br.com.vw.uptime.schedule.infrastructure.entities.checkup.FieldCampaignEntity
import br.com.vw.uptime.schedule.infrastructure.services.fieldAction.Campaign

class FieldCampaignConverter {
    companion object {
        fun campaignChildEntityToCampaign(fieldCampaignEntity: FieldCampaignEntity) : Campaign {
            return with(Mapping.copy(fieldCampaignEntity.campaign, Campaign())) {
                dn = fieldCampaignEntity.dn
                vehicle = fieldCampaignEntity.vehicle
                repairDate = fieldCampaignEntity.repairDate
                repairStatus = fieldCampaignEntity.repairStatus
                this
            }
        }
    }
}