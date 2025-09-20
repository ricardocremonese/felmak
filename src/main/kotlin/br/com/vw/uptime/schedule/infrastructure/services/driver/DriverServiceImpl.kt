package br.com.vw.uptime.schedule.infrastructure.services.driver

import br.com.vw.uptime.schedule.core.models.drivers.Driver
import br.com.vw.uptime.schedule.infrastructure.repositories.driver.DriverRepository
import org.springframework.stereotype.Service


@Service
class DriverServiceImpl(
    private val driverRepository: DriverRepository
) {

    fun drivers(search:String): List<Driver> {
        val driversList = driverRepository.drivers(search)
        return driversList.map {
            Driver(it)
        }
    }

}