package br.com.vw.uptime.schedule.infrastructure.services.checkup

import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.FleetGroupData
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.FleetGroupsRepository
import org.springframework.stereotype.Service


@Service
class FleetGroupServiceImpl(
    val fleetGroupsRepository: FleetGroupsRepository
) {

    fun groups(accountId:String) : List<FleetGroup> {
        return fleetGroupsRepository.getFleetGroupsByAccountId(accountId).map {
            FleetGroup(it)
        }
    }
}

class FleetGroup(
    private val fleetGroupData: FleetGroupData
) {

    fun getId() : String {
        return fleetGroupData.id
    }

    fun getName() : String {
        return fleetGroupData.name
    }

}