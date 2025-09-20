package br.com.vw.uptime.schedule.infrastructure.services.checkup

import br.com.vw.uptime.schedule.infrastructure.repositories.dealerships.DealershipTransRioRepository
import org.springframework.stereotype.Service

@Service
class ChassisToModelWithGroupService(
    val modelManualService:ModelManualService,
    val dealershipTransRioRepository: DealershipTransRioRepository
) {



    fun getModelAndGroupService(chassis:String) : ModelAndGroupData? {
        val transRioEntity = dealershipTransRioRepository.findByChassis(chassis)
        if(transRioEntity == null) {
            return null
        }
        val modelCode = transRioEntity.modelCode
        return ModelAndGroupData(
            modelCode = modelCode,
            maintenanceGroup = transRioEntity.maintenanceGroup
        )
    }

}

class ModelAndGroupData(
    val modelCode:String,
    val maintenanceGroup:Int
)