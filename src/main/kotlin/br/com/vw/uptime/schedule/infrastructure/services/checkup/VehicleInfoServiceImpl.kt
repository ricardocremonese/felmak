package br.com.vw.uptime.schedule.infrastructure.services.checkup

import br.com.vw.uptime.schedule.core.enums.checkups.MaintenanceGroupEnum
import br.com.vw.uptime.schedule.core.enums.checkups.MetricTypeEnum
import br.com.vw.uptime.schedule.core.enums.maintenance.StepType
import br.com.vw.uptime.schedule.core.models.maintenance.*
import br.com.vw.uptime.schedule.core.utils.LogPoint
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.AssetsRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.CheckupOdpData
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.UptimeAssetRepository
import br.com.vw.uptime.schedule.infrastructure.services.asset.MetricDates
import br.com.vw.uptime.schedule.infrastructure.services.asset.OdometerService
import br.com.vw.uptime.schedule.infrastructure.services.asset.OdpDbService
import br.com.vw.uptime.schedule.infrastructure.services.checkup.CheckVehicleServiceImpl.NearCheckupChecking
import br.com.vw.uptime.schedule.infrastructure.services.fieldAction.Campaign
import br.com.vw.uptime.schedule.infrastructure.services.fieldAction.FieldCampaignServiceImpl
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.LocalTime

@Service
class VehicleInfoServiceImpl(
    val checkVehicleServiceImpl: CheckVehicleServiceImpl,
    val checkupScheduleServiceImpl: CheckupScheduleServiceImpl,
    val fieldCampaignServiceImpl: FieldCampaignServiceImpl,
    val odometerService: OdometerService,
    val periodicCheckupsService: PeriodicCheckupsService,
    val assetsRepository: AssetsRepository,
    val odpDbService: OdpDbService,
    val checkupInterval: CheckupInterval,
    val uptimeAssetRepository: UptimeAssetRepository,
    ) {

    @Value("\${left-km-for-checkup}")
    var leftKmForCheckup:Long = 0

    @Value("\${left-hour-for-checkup}")
    var leftHourForCheckup:Long = 0

    companion object {
        val log: Logger = LoggerFactory.getLogger(VehicleInfoServiceImpl::class.java)
    }

    fun allVehiclesV1(request: VehicleInfoRequest) : VehicleInfoTable {

        val assetsAll = request.assets
        val assetMetricsList = LogPoint("Asset extern hist loading").log {
            val assetsId = assetsAll.map {
                it.id
            }
            odometerService.odometerHourMeterByAssetsId(assetsId)
        }

        val maintenanceList = mutableListOf<VehicleInfo>()

        val now = LocalDateTime.now()
        val hasWarranty : (LocalDateTime) -> String = { if (now.isBefore(it)) "Em Garantia" else "Expirado" }
            val vehiclesInfoFromOdp = odpDbService.getCheckupOdpByChassisList(assetsAll.mapNotNull { it.identification }.toList())

        return LogPoint("Inside for to return maintenance").log {
            for (assetExtern in assetsAll) {
                val assetMetric = assetMetricsList.firstOrNull {
                    it.assetId == assetExtern.id
                }

                val checkupSchedules = assetExtern.identification?.let {
                    checkupScheduleServiceImpl.checkupScheduleByVehicleChassis(it)
                } ?: listOf()

                val campaigns = getValidCampaigns(assetExtern.identification, checkupSchedules)
                maintenanceList.add(with(VehicleInfo()) {

                    val vehicleOdp = getVehicleByChassis(assetExtern.identification, vehiclesInfoFromOdp)
                    val maintenanceGroup = vehicleOdp.maintenanceGroup
                    val maintenanceGroupId = maintenanceGroup?.let { label ->
                        MaintenanceGroupEnum.byMaintenanceGroupName(label)?.value()
                    }
                    vehicle = with(VehicleTable()) {
                        assetId = assetExtern.id
                        chassis = assetExtern.identification ?: "-"
                        odometer = assetMetric?.vehicleMetrics?.odometer?.toLong()
                        hourMeter = assetMetric?.vehicleMetrics?.hourMeter?.toLong()
                        metricDates = assetMetric?.dates
                        vehicleModel = vehicleOdp.modelDescription
                        vehicleGroup = maintenanceGroup ?: "-"
                        this.vehicleGroupId = maintenanceGroupId ?: ""
                        this
                    }
                    this.campaigns = Campaigns(
                        number = campaigns.size,
                        list = campaigns
                    )
                    vehicleScore = -1
                    warrantyStatus = vehicleOdp.warranty?.end?.let(hasWarranty) ?: "-"
                    vehiclePlan = emptyList()
                    status = "-"
                    volksTotal = vehicleOdp.volkstotal?.let {
                        if(it.status == "Ativo") {
                            it.modality
                        } else {
                            ""
                        }
                    } ?: ""
                    checkupStatus = ""

                    lastVehicleCheckup = null
                    nextVehicleCheckup = null
                    previousCheckups = emptyList()
                    nextCheckups = emptyList()

                    this.metricType = null

                    this.geoLocation = with(VehicleGeoLocation()) {
                        lat = 0.0
                        lng = 0.0
                        this
                    }
                    this
                })
            }
            with(VehicleInfoTable()) {
                list = maintenanceList
                this
            }
        }
    }

    fun getVehicleCheckupInfo(
        chassis: String?,
        maintenanceGroupId: String?,
        vehicleMetrics: VehicleMetrics?,
        checkupSchedules: List<CheckupSchedule>,
        vehicleOdp: CheckupOdpData
    ): VehicleCheckupInfo {
        // Se vehicleMetrics não tiver dados de odômetro ou horímetro, buscar da tabela uptimeAsset
        val uptimeAsset = if(!chassis.isNullOrBlank()) uptimeAssetRepository.findByChassis(chassis) else null
        VehicleMetrics().apply {
            odometer = vehicleMetrics?.odometer ?: uptimeAsset?.odometer?.toDouble()
            hourMeter = vehicleMetrics?.hourMeter ?: uptimeAsset?.hourmeter?.toDouble()
        }
        val enhancedVehicleMetrics = VehicleMetrics().apply {
            odometer = vehicleMetrics?.odometer ?: uptimeAsset?.odometer?.toDouble()
            hourMeter = vehicleMetrics?.hourMeter ?: uptimeAsset?.hourmeter?.toDouble()
        }

        val lastOdometerRevision = vehicleOdp.revisions?.sortedByDescending {r -> r.mileage }?.firstOrNull()?.mileage ?: 0
        val amountFinishedCheckups = checkupSchedules.filter {
            it.vehicleSchedule.maintenance?.statusId == StepType.FINISHED.name
        }.count() + (vehicleOdp.revisions?.count() ?: 0)
        val vehicleCheckups = chassis?.let {
            getCheckupInfo(
                it,
                maintenanceGroupId,
                enhancedVehicleMetrics,
                checkupSchedules,
                lastOdometerRevision.toDouble(),
            )
        }

        val checkupStamps = vehicleCheckups?.let {
            vehicleOdp.revisions?.let { rev ->
                periodicCheckupsService.getPeriodicCheckupsPreLoaded(
                    it,
                    schedules = checkupSchedules,
                    checkupsOdp = rev
                )
            }
        } ?: CheckupStamps()

        val lastVehicleCheckup = checkupStamps.previousCheckups.lastOrNull()?.let {
            stampCheckupToStampLast(it)
        }

        val previousCheckups = ArrayList(checkupStamps.previousCheckups.map {
            stampCheckupToStampLast(it)
        })

        // Agrupa checkups duplicados e junta os service orders
        val groupedCheckups = previousCheckups.groupBy { checkup ->
            Triple(
                checkup.maintenance?.dealershipName ?: "",
                checkup.schedule?.getScheduledDate(),
                checkup.schedule?.getOdometer() ?: 0L
            )
        }.map { (_, checkups) ->
            if (checkups.size == 1) {
                checkups.first()
            } else {
                // Se há duplicados, pega o primeiro e junta os service orders
                val firstCheckup = checkups.first()
                val serviceOrders = checkups.mapNotNull { it.maintenance?.serviceOrder }.filter { it.isNotBlank() }
                
                if (serviceOrders.isNotEmpty()) {
                    firstCheckup.maintenance?.serviceOrder = serviceOrders.joinToString(", ")
                }
                
                firstCheckup
            }
        }
        previousCheckups.clear()
        previousCheckups.addAll(groupedCheckups)

        previousCheckups.add(0, generateStampPrevious())
        if(previousCheckups.size >= 2) {
            val prev = previousCheckups[1]
            prev.title = "Assentamento"
        }

        var numberNext = (previousCheckups.size - 1).let {
            if(it < 1) 1
            else it
        }

        val nextCheckup = checkRangeInterval(
            vehicleCheckups?.nextCheckup,
            enhancedVehicleMetrics,
            maintenanceGroupId,
            numberNext
        )
        for(number in 3 .. previousCheckups.size) {
            previousCheckups[number - 1].title = "${number - 2}º"
        }

        val nextCheckupList = vehicleCheckups?.nextCheckup?.let { listOf(it) } ?: (listOf())

        val nextCheckupsCurrent = nextCheckupList.map {
            toScheduleCheckupNext(it, numberNext)
        }

        val afterNextCheckup = addedCheckups(numberNext + nextCheckupList.size)
        val nextCheckups = nextCheckupsCurrent + afterNextCheckup

        if(nextCheckups.isNotEmpty() && nextCheckups[0].schedule == null) {
            nextCheckups[0].canSchedule = true
        }

        val metricType = maintenanceGroupId?.let {
            MetricTypeEnum.getMetricTypeByGroupId(it).label
        }

        return VehicleCheckupInfo(
            lastVehicleCheckup = lastVehicleCheckup,
            nextVehicleCheckup = nextCheckup,
            previousCheckups = previousCheckups,
            nextCheckups = nextCheckups,
            metricType = metricType,
            chassis = chassis
        )
    }

    private fun addedCheckups(numberNext: Int): List<NextCheckups> {
        val list = ArrayList<NextCheckups>()
        for(i in numberNext .. 37) {
            list.add(generateNextCheckups(i))
        }
        return list
    }

    fun getVehicleCheckupInfoByChassis(assetRequest: AssetRequest): VehicleCheckupInfo {
        return LogPoint("Get vehicle checkup info by chassis").log {
            val chassis = assetRequest.identification
            // Validar chassis para evitar erro do DynamoDB
            if (chassis.isNullOrBlank()) {
                throw IllegalArgumentException("Chassis cannot be null or empty")
            }

            // Buscar métricas do veículo
            val assetMetrics = odometerService.odometerHourMeterByAssetsId(listOf(assetRequest.id))
            val vehicleMetric = assetMetrics.firstOrNull()?.vehicleMetrics

            // Buscar informações do ODP
            val vehiclesInfoFromOdp = odpDbService.getCheckupOdpByChassisList(listOf(chassis))
            val vehicleOdp = getVehicleByChassis(chassis, vehiclesInfoFromOdp)
            
            // Buscar agendamentos
            val checkupSchedules = checkupScheduleServiceImpl.checkupScheduleByVehicleChassis(chassis)
            
            // Determinar grupo de manutenção
            val maintenanceGroup = vehicleOdp.maintenanceGroup
            val maintenanceGroupId = maintenanceGroup?.let { label ->
                MaintenanceGroupEnum.byMaintenanceGroupName(label)?.value()
            }

            getVehicleCheckupInfo(
                chassis = chassis,
                maintenanceGroupId = maintenanceGroupId,
                vehicleMetrics = vehicleMetric,
                checkupSchedules = checkupSchedules,
                vehicleOdp = vehicleOdp
            )
        }
    }

    fun getVehicleCheckupInfoBatch(assetList: List<AssetRequest>): List<VehicleCheckupInfo> {
        return LogPoint("Get vehicle checkup info batch").log {
            if (assetList.isEmpty()) {
                return@log emptyList()
            }

            // Filtrar chassis vazios ou nulos para evitar erro do DynamoDB
            val validAssetList = assetList.filter { !it.identification.isNullOrBlank() }
            
            if (validAssetList.isEmpty()) {
                return@log emptyList()
            }

            val chassisList = validAssetList.mapNotNull { it.identification }

            // Buscar informações do ODP para todos os chassis
            val vehiclesInfoFromOdp = odpDbService.getCheckupOdpByChassisList(chassisList)
            
            // Buscar agendamentos para todos os chassis
            val allCheckupSchedules = checkupScheduleServiceImpl.checkupScheduleByVehicleChassisList(chassisList)

            // Buscar métricas do veículo
            val assetMetrics = odometerService.odometerHourMeterByAssetsId(
                assetList.map { it.id }
            )

            // Processar cada chassis
            validAssetList.map { assetRequest ->
                val assetMetric = assetMetrics.firstOrNull {
                    it.assetId == assetRequest.id
                }
                // Buscar métricas do veículo individualmente (fallback para uptimeAsset está no getVehicleCheckupInfo)
                val vehicleOdp = getVehicleByChassis(assetRequest.identification, vehiclesInfoFromOdp)
                val checkupSchedules = allCheckupSchedules.filter { it.vehicleSchedule.vehicle.chassis == assetRequest.identification }
                
                val maintenanceGroup = vehicleOdp.maintenanceGroup
                val maintenanceGroupId = maintenanceGroup?.let { label ->
                    MaintenanceGroupEnum.byMaintenanceGroupName(label)?.value()
                }

                getVehicleCheckupInfo(
                    chassis = assetRequest.identification,
                    maintenanceGroupId = maintenanceGroupId,
                    vehicleMetrics = assetMetric?.vehicleMetrics, // Será buscado no getVehicleCheckupInfo via fallback
                    checkupSchedules = checkupSchedules,
                    vehicleOdp = vehicleOdp
                )
            }
        }
    }

    private fun checkRangeInterval(
        nextCheckup: CheckupAndSchedule?,
        vehicleMetrics: VehicleMetrics?,
        maintenanceGroupId: String?,
        seqNumber:Int
    ): NextCheckups? {
        if(nextCheckup == null) {
            return null
        }
        if(nextCheckup.checkupSchedule != null) {
            return toScheduleCheckupNext(nextCheckup, seqNumber)
        }
        val checkup = nextCheckup.checkup
        if(checkup == null) {
            return toScheduleCheckupNext(nextCheckup, seqNumber)
        }
        if(vehicleMetrics == null) {
            return toScheduleCheckupNext(nextCheckup, seqNumber)
        }
        if(maintenanceGroupId == null) {
            return null
        }
        val range = checkup.range.start
        val metricValue = CheckVehicleServiceImpl.odometerOrHourMeter(
            maintenanceGroupId,
            vehicleMetrics
        )
        if (metricValue == null) {
            return toScheduleCheckupNext(nextCheckup, seqNumber)
        }
        val nearCheckupChecking = NearCheckupChecking(
            maxLeftKm = leftKmForCheckup,
            maxLeftHour = leftHourForCheckup,
            metricType = MetricTypeEnum.getMetricTypeByGroupId(maintenanceGroupId),
            odometerOrHourMeter = metricValue.toLong()
        )
        if(nearCheckupChecking.isCheckupNear(range)) {
            return toScheduleCheckupNext(nextCheckup, seqNumber)
        }
        return null
    }

    private fun generateStampPrevious(): StampLast {
        return StampLast().apply {
            this.title = "Entrega técnica"
            this.maintenance = MaintenanceStamp().apply {
                statusId = ""
                checkoutDate = null
                this.serviceOrder = ""
                this.checkupType = "Entrega técnica"
                this.dealershipName = ""
                this.consultantName = ""
            }
            this.checkup = null
            this.schedule = null
            this.origin = ""
        }
    }

    private fun stampCheckupToStampLast(stamp: StampCheckup): StampLast {
        val madeCheckup = stamp.getMadeCheckup()
        return StampLast().apply {
            this.maintenance = MaintenanceStamp().apply {
                statusId = if(madeCheckup == null) "" else StepType.FINISHED.name
                checkoutDate = madeCheckup?.finishedDate?.let {
                    LocalDateTime.of(it, LocalTime.of(0, 0))
                }
                this.serviceOrder =  madeCheckup?.os
                this.checkupType = stamp.getCheckupType()
                this.dealershipName = stamp.getDealershipName()
                this.consultantName = stamp.getConsultantName()
            }
            this.checkup = stamp.getRange()?.let {
                Checkup().apply {
                    this.range = it
                }
            }
            this.schedule = StampMaintenanceInfo(stamp)
            this.origin = stamp.getOrigin()
        }
    }

    private fun getValidCampaigns(identification:String?, checkupSchedules: List<CheckupSchedule>): List<Campaign> {
        val allVehicleCampaigns = identification?.let {
            fieldCampaignServiceImpl.pendingFieldActionListByChassis(it)
        } ?: arrayListOf()
        return this.checkupScheduleServiceImpl.fieldCampaignsAvailable(
            allVehicleCampaigns,
            checkupSchedules
        )
    }

    private fun getCheckupInfo(
        chassis: String,
        maintenanceGroupId: String?,
        vehicleMetrics: VehicleMetrics?,
        checkupSchedules: List<CheckupSchedule>,
        lastOdometerRevision: Double,
    ): VehicleCheckups {
        val vehicleParams = toVehicleParams(chassis, maintenanceGroupId, vehicleMetrics)
        return checkVehicleServiceImpl.check(vehicleParams, checkupSchedules, lastOdometerRevision)
    }

    private fun toVehicleParams(
        chassis: String,
        maintenanceGroupId: String?,
        vehicleMetricsParam: VehicleMetrics?
    ): VehicleParams {
        return with(VehicleParams()) {
            this.chassis = chassis
            this.group = maintenanceGroupId
            vehicleMetrics = VehicleMetrics().apply {
                odometer = vehicleMetricsParam?.odometer
                hourMeter =  vehicleMetricsParam?.hourMeter
            }
            this
        }
    }

    private fun generateNextCheckups(index:Int) : NextCheckups {
        return with(NextCheckups()) {
            title = "${index}º"
            checkup = null
            this.schedule = null
            maintenance = null
            this
        }
    }

    private fun toScheduleCheckupNext(checkupAndSchedule: CheckupAndSchedule, index:Int) : NextCheckups {
        val schedule = checkupAndSchedule.checkupSchedule
        return with(NextCheckups()) {
            title = "${index}º"
            checkup = checkupAndSchedule.checkup ?: schedule?.checkup
            this.schedule = ScheduleMaintenanceInfo(
                checkupAndSchedule.checkupSchedule,
                checkupAndSchedule.checkup
            )
            maintenance = checkupAndSchedule.checkupSchedule?.vehicleSchedule?.maintenance
            this
        }
    }

    private fun getVehicleByChassis(chassi: String?, vehicles: List<CheckupOdpData>) : CheckupOdpData {
        val emptyCheckupOdpData = CheckupOdpData(
            chassis = "-",
            maintenanceGroup = "-",
            modelDescription = "-",
            modelCode = "-",
            warranty = null,
            volkstotal = null,
            order = null,
            revisions = emptyList())
        return vehicles.stream().filter { vehicle -> vehicle.chassis == chassi }.findFirst().orElse(emptyCheckupOdpData)
    }

    private fun filterAssets(groupIds: List<String>, assetsIds: List<String>, chassis: String?): List<AssetExtern> {
        val allAssets = LogPoint("Asset extern loading").log {
            assetsRepository.getAllVehicleAssets()
        }
        val filteredAssets = if(groupIds.isEmpty() && assetsIds.isEmpty()) {
            allAssets
        } else {
            val withGroups = allAssets.filter { asset ->
                asset.embedded?.tags?.items?.any { group ->
                    groupIds.any { groupIdParam ->
                        groupIdParam == group.id
                    }
                } ?: false
            }
            val withAssets = allAssets.filter { asset ->
                assetsIds.any {
                    asset.id == it
                }
            }
            withGroups + withAssets
        }

        val filteredByChassis = if (chassis.isNullOrEmpty()) {
            filteredAssets
        } else {
            filteredAssets.filter { asset ->
                asset.identification?.contains(chassis, ignoreCase = true) ?: false
            }
        }

        return filteredByChassis
    }

    fun getEngineByChassis(chassis: String) : EngineInfo {
        return checkupInterval.getEngineModelByChassis(chassis)?.let { EngineInfo(it.emissionStandard, it.engine) }
            ?: EngineInfo()
    }

    fun getChassisWithOverdueCheckups(chassisList: List<String>): List<String> {
        return LogPoint("Get chassis with overdue checkups").log {
            if (chassisList.isEmpty()) {
                return@log emptyList()
            }

            val validChassisList = chassisList.filter { !it.isNullOrBlank() }
            
            if (validChassisList.isEmpty()) {
                return@log emptyList()
            }

            val overdueChassis = mutableListOf<String>()

            // Buscar informações do ODP para todos os chassis
            val vehiclesInfoFromOdp = odpDbService.getCheckupOdpByChassisList(validChassisList)
            
            // Buscar agendamentos para todos os chassis
            val allCheckupSchedules = checkupScheduleServiceImpl.checkupScheduleByVehicleChassisList(validChassisList)
            
            // Processar cada chassis
            validChassisList.forEach { chassis ->
                try {
                    // Buscar métricas do veículo (com fallback para uptimeAsset)
                    val vehicleOdp = getVehicleByChassis(chassis, vehiclesInfoFromOdp)
                    val checkupSchedules = allCheckupSchedules.filter { it.vehicleSchedule.vehicle.chassis == chassis }
                    
                    val maintenanceGroup = vehicleOdp.maintenanceGroup
                    val maintenanceGroupId = maintenanceGroup?.let { label ->
                        MaintenanceGroupEnum.byMaintenanceGroupName(label)?.value()
                    }

                    val assetMetrics = odometerService.odometerHourMeterByAssetsId(listOf(chassis))
                    val vehicleMetrics = assetMetrics.firstOrNull()?.vehicleMetrics

                    val checkupInfo = getVehicleCheckupInfo(
                        chassis = chassis,
                        maintenanceGroupId = maintenanceGroupId,
                        vehicleMetrics = vehicleMetrics,
                        checkupSchedules = checkupSchedules,
                        vehicleOdp = vehicleOdp
                    )

                    // Verificar se há checkups atrasados
                    if (hasOverdueCheckups(checkupInfo, maintenanceGroupId)) {
                        overdueChassis.add(chassis)
                        log.debug("Chassis $chassis has overdue checkups")
                    }
                } catch (e: Exception) {
                    log.warn("Error processing chassis $chassis for overdue checkups: ${e.message}")
                }
            }

            overdueChassis
        }
    }

    /**
     * Verifica se um veículo possui checkups atrasados em nextCheckups
     */
    private fun hasOverdueCheckups(checkupInfo: VehicleCheckupInfo, maintenanceGroupId: String?): Boolean {
        if (checkupInfo.nextCheckups.isEmpty()) {
            return false
        }

        val currentMetrics = if (!checkupInfo.chassis.isNullOrBlank()) {
            val assetMetrics = odometerService.odometerHourMeterByAssetsId(listOf(checkupInfo.chassis))
            val vehicleMetrics = assetMetrics.firstOrNull()?.vehicleMetrics
            
            // Fallback para uptimeAsset se necessário
            if (vehicleMetrics?.odometer == null && vehicleMetrics?.hourMeter == null) {
                val uptimeAsset = uptimeAssetRepository.findByChassis(checkupInfo.chassis)
                if (uptimeAsset != null) {
                    VehicleMetrics().apply {
                        odometer = uptimeAsset.odometer?.toDouble()
                        hourMeter = uptimeAsset.hourmeter?.toDouble()
                    }
                } else {
                    vehicleMetrics
                }
            } else {
                vehicleMetrics
            }
        } else {
            null
        }

        if (currentMetrics == null || maintenanceGroupId == null) {
            return false
        }

        // Obter o valor métrico atual (odômetro ou horímetro)
        val currentMetricValue = CheckVehicleServiceImpl.odometerOrHourMeter(
            maintenanceGroupId,
            currentMetrics
        ) ?: return false

        // Verificar se algum checkup em nextCheckups tem range.start menor que o valor atual
        return checkupInfo.nextCheckups.any { nextCheckup ->
            val checkupRange = nextCheckup.checkup?.range?.start ?: nextCheckup.schedule?.getOdometer() ?: 0L
            checkupRange < currentMetricValue.toLong()
        }
    }
}

class VehicleGeoLocation {
    var lat:Double = 0.0
    var lng:Double = 0.0
}

class Campaigns(
    var number:Int,
    var list:List<Campaign> = arrayListOf()
)

class VehicleTable {

    var assetId:String = ""
    var chassis:String = ""
    var vehicleModel:String? = null
    var odometer: Long? = null
    var hourMeter: Long? = null

    /**
     * Rodoviário, Especial, Misto, Severo
     */
    var vehicleGroup:String = ""
    var vehicleGroupId:String = ""
    var name:String? = ""
    var metricDates:MetricDates? = null
}

data class EngineInfo(val emissionStandard: String? = null, val engine: String? = null)