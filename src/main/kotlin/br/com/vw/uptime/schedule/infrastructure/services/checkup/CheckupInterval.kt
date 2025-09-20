package br.com.vw.uptime.schedule.infrastructure.services.checkup

import br.com.vw.uptime.schedule.core.enums.checkups.MaintenanceGroupEnum
import br.com.vw.uptime.schedule.core.models.maintenance.VehicleMetrics
import br.com.vw.uptime.schedule.infrastructure.entities.maintenance.EngineModelEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.EngineModelRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.MaintenanceRangeRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.BigInteger

@Service
class CheckupInterval(
    val engineModelRepository: EngineModelRepository,
    val maintenanceRangeRepository:MaintenanceRangeRepository) {

    private val log = LoggerFactory.getLogger(CheckupInterval::class.java)
    companion object {

        private const val CHASSIS_REGEX = "^(\\w{3})(\\w{2})(\\w{1})(\\w{2})(\\w{1})(\\w{1})(\\w{1})(\\w{1,})\$"
    }

    fun getCheckupInterval(chassis:String, maintenanceGroupId:String) : Long? {
        val engineModel : EngineModelEntity? = getEngineModelByChassis(chassis)

        if(engineModel == null) {
            log.warn("Motor não encontrado para o chassi: [$chassis]. Retorna o intervalo default para o maintenance group com id [$maintenanceGroupId]")
            return defaultInterval(maintenanceGroupId = maintenanceGroupId)
        }

        log.info("Buscar o intervalo de manutenção para o chassi [$chassis] com parametros groupId: [$maintenanceGroupId] , motor: [${engineModel.engine}], norma:[${engineModel.emissionStandard}] e cilindradas: [${engineModel.cc}]")
        val maintenanceRangeEntity = maintenanceRangeRepository.findByGroupAndType(
            MaintenanceGroupEnum.byId(maintenanceGroupId).name,
            engineModel.engine,
            engineModel.emissionStandard,
            engineModel.cc
        )

        if(maintenanceRangeEntity == null) {
            log.warn("Intervalo de km para manutenção não encontrado para o chassi [$chassis]. Retorna o intervalo default para o maintenance group com id [$maintenanceGroupId]")
            return defaultInterval(maintenanceGroupId, engineModel.emissionStandard)
        }

        log.info("Intervalo de manutenção para o chassi [$chassis] localizado. Range KM [${maintenanceRangeEntity.km}] e HOURS [${maintenanceRangeEntity.hours}]")
        return metricValue(
            maintenanceRangeEntity.km,
            maintenanceRangeEntity.hours,
            maintenanceGroupId
        )?.toLong()
    }

    fun getEngineModelByChassis(chassis: String) : EngineModelEntity? {

        log.info("Buscar intervalo de manutenção para o chassi: [$chassis]")

        if (Regex(CHASSIS_REGEX).matches(chassis)) {
            log.info("O chassis [$chassis] coincide com o padrão [$CHASSIS_REGEX], será feita a busca do motor pelos digitos do chassi")

            val splitChassis = Regex(CHASSIS_REGEX).find(chassis)?.groups!!

            val digit45 = splitChassis[2]!!.value
            val digit6 = splitChassis[3]!!.value
            val digit78 = splitChassis[4]!!.value

            log.info("Buscar o motor e norma de emissão para o chassi: [$chassis] com os parametros: dig45:[$digit45], dig6: [$digit6] dig78: [$digit78]")

            return engineModelRepository.findByChassis(digit45, digit6, digit78)
        } else {
            log.warn("O chassis: [$chassis] não coincide com o padrão [$CHASSIS_REGEX]")
            return null
        }
    }

    private fun defaultInterval(maintenanceGroupId:String, emissionStandard: String? = null): Long? {
        val group = MaintenanceGroupEnum.byId(maintenanceGroupId)

        return maintenanceRangeRepository.findByGroupAndEmissionStandard(group.name, emissionStandard)
            .sortedBy { it.km }
            .first{
            metricValue(it.km, it.hours, maintenanceGroupId)?.longValueExact()?.toInt() != 0
        }.let {
            metricValue(it.km, it.hours, maintenanceGroupId)?.longValueExact()
        }
    }

    fun metricValue(odometer:BigDecimal, hourMeter:BigInteger, group:String): BigInteger? {
        val metricVal = CheckVehicleServiceImpl.odometerOrHourMeter(
            group,
            VehicleMetrics().apply {
                this.odometer = odometer.toDouble()
                this.hourMeter = hourMeter.toDouble()
            }
        )
        return metricVal?.let {
            BigDecimal.valueOf(it).toBigInteger()
        }
    }
}