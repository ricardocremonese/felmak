package br.com.vw.uptime.schedule.core.models.maintenance

import br.com.vw.uptime.schedule.core.enums.checkups.CheckupTypeScheduleEnum

class Checkup {

    lateinit var range: CheckupRange
    var maintenanceGroupId:String? = null
    val checkupType:CheckupType = CheckupType()
    var type:CheckupTypeScheduleEnum? = null
    var hasCampaigns:Boolean? = null
}

class CheckupType(
    val id:String = "1",
    val name:String = "",
    val services:List<String> = arrayListOf()
)