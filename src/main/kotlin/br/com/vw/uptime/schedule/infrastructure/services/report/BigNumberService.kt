package br.com.vw.uptime.schedule.infrastructure.services.report

import br.com.vw.uptime.schedule.core.converters.CheckupScheduleConverter
import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.enums.checkups.MaintenanceGroupEnum
import br.com.vw.uptime.schedule.core.enums.maintenance.StepType
import br.com.vw.uptime.schedule.core.enums.schedule.InviterType
import br.com.vw.uptime.schedule.core.enums.schedule.ScheduleStateEnum
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.core.models.maintenance.CheckupSchedule
import br.com.vw.uptime.schedule.core.models.maintenance.VehicleMetrics
import br.com.vw.uptime.schedule.core.models.maintenance.VehicleParams
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.requests.ChassisRequest
import br.com.vw.uptime.schedule.infrastructure.entities.asset.AssetMetricEntity
import br.com.vw.uptime.schedule.infrastructure.entities.checkup.CheckupScheduleEntity
import br.com.vw.uptime.schedule.infrastructure.gateway.RioGateway
import br.com.vw.uptime.schedule.infrastructure.gateway.RioMaintenanceGateway
import br.com.vw.uptime.schedule.infrastructure.gateway.request.AssetBigNumberRequest
import br.com.vw.uptime.schedule.infrastructure.gateway.request.AssetIdsNullRequest
import br.com.vw.uptime.schedule.infrastructure.gateway.request.AssetIdsRequest
import br.com.vw.uptime.schedule.infrastructure.gateway.request.AssetsRequest
import br.com.vw.uptime.schedule.infrastructure.gateway.response.FaultCodesCardResponse
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.AssetsDbRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.CheckupOdpData
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.CheckupScheduleRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.consultants.ConsultantsRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.maintenance.MaintenanceRepository
import br.com.vw.uptime.schedule.infrastructure.services.asset.AssetMetricService
import br.com.vw.uptime.schedule.infrastructure.services.asset.OdometerService
import br.com.vw.uptime.schedule.infrastructure.services.asset.OdpDbService
import br.com.vw.uptime.schedule.infrastructure.services.checkup.CheckVehicleServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.checkup.CheckupScheduleServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.fieldAction.Campaign
import br.com.vw.uptime.schedule.infrastructure.services.fieldAction.FieldCampaignServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.user.UserRole
import br.com.vw.uptime.schedule.infrastructure.services.user.UserRoleService
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class BigNumberService(val rioMaintenanceGateway: RioMaintenanceGateway,
                       val maintenanceRepository: MaintenanceRepository,
                       val checkupScheduleRepository: CheckupScheduleRepository,
                       val checkupScheduleServiceImpl:CheckupScheduleServiceImpl,
                       val fieldCampaignServiceImpl:FieldCampaignServiceImpl,
                       val userRoleService: UserRoleService,
                       val consultantsRepository: ConsultantsRepository,
                       val assetsDbRepository: AssetsDbRepository,
                       val checkVehicleServiceImpl: CheckVehicleServiceImpl,
                       val assetMetricService: AssetMetricService,
                       val odometerService: OdometerService,
                       val odpDbService: OdpDbService) {



    protected val log: Logger = LoggerFactory.getLogger(RioGateway::class.java)

    fun getTotalVehiclesInAttention(assetsIdsRequest: AssetIdsRequest) : FaultCodesCardResponse  {
        try {
            return rioMaintenanceGateway.getFaultCodesCard(assetsIdsRequest)
        } catch (ex: Exception) {
            log.error("Falha ao obter Big Numbers de veículos em atenção crítica e básica.", ex)
        }

        return FaultCodesCardResponse(scores = emptyList(), total = 0)
    }

    fun getTotalVehiclesFinishedByAccountId(userAuthenticate: UserAuthenticate, assetsIdsRequest: AssetIdsNullRequest) : BigNumbersAssetsIdsResponse {
        val checkupsByAssetId = getFilteredCheckupsGroupedByAccountId(userAuthenticate, assetsIdsRequest)

        val vehiclesMaintenanceFinished = arrayListOf<String>()
        val selectedAssetIds = arrayListOf<String>()

        for((userAssetId, checkupsForThisAsset) in checkupsByAssetId) {
            val chassis = checkupsForThisAsset.firstOrNull()?.chassis
            val checkupsForThisAssetFinished = checkupsForThisAsset.filter {
                it.vehicleSchedule.maintenance?.statusId == StepType.FINISHED.name
            }
            if(checkupsForThisAssetFinished.isNotEmpty()) {
                if(userAssetId != null) {
                    selectedAssetIds.add(userAssetId)
                }
                if(chassis != null) {
                    vehiclesMaintenanceFinished.add(chassis)
                }
            }
        }
        return BigNumbersAssetsIdsResponse(
            selectedAssetIds.size,
            vehiclesMaintenanceFinished,
            selectedAssetIds
        )
    }

    private fun checkCampaign(identification:String, checkupScheduleList: List<CheckupSchedule>): Int {
        val allVehicleCampaigns = fieldCampaignServiceImpl.pendingFieldActionListByChassis(identification)
        for(vehicleCampaign in allVehicleCampaigns) {
            if(!existsCampaignsFromSchedules(vehicleCampaign, checkupScheduleList)) {
                return 1
            }
        }
        return 0
    }

    private fun getAssetIdAccordingToRole(userRole:UserRole, checkupSchedule:CheckupScheduleEntity) :String? {
        return when(userRole.role) {
            InviterType.TOWER.name -> checkupSchedule.towerAssetId
            InviterType.MANAGER.name -> checkupSchedule.assetId
            InviterType.CONSULTANT.name -> checkupSchedule.towerAssetId
            else -> throw IllegalArgumentException(inviterTypeNotExistsMessage())
        }
    }

    private fun existsCampaignsFromSchedules(vehicleCampaign: Campaign, checkupScheduleList: List<CheckupSchedule>): Boolean {
        for(oneCheckupSchedule in checkupScheduleList) {
            val hasSchedule = isCampaignInCampaignSchedules(vehicleCampaign, oneCheckupSchedule.campaigns)
            if(hasSchedule) {
                return true
            }
        }
        return false
    }

    private fun isCampaignInCampaignSchedules(vehicleCampaign: Campaign, campaignsFromSchedules: List<Campaign>): Boolean {
        for(scheduleCampaign in campaignsFromSchedules) {
            if(vehicleCampaign.number == scheduleCampaign.number) {
                return true
            }
        }
        return false
    }
    
    fun getTotalVehicleWithVolksTotalPlan(assetsRequest: AssetsRequest) : BigNumbersResponse {
        val selectedChassis = arrayListOf<String>()
        val chunkedList = assetsRequest.assets.chunked(150)

        for(list in chunkedList) {
            val chassisList = list.mapNotNull {
                it.identification
            }
            val vehiclesInfos = odpDbService.getCheckupOdpByChassisList(chassisList)
            for(vehicleInfo in vehiclesInfos) {
                if(vehicleInfo.volkstotal?.status == "Ativo") {
                    selectedChassis.add(vehicleInfo.chassis)
                }
            }
        }

        return BigNumbersResponse(selectedChassis.size, selectedChassis)
    }

    fun getTotalVehicleWithFieldCampaign(chassisRequest: ChassisRequest) : BigNumbersResponse {

        var readyToScheduleChassis = emptyList<String>().toMutableList()

        val checkupScheduleByChassis = checkupScheduleServiceImpl.checkupScheduleByVehicleChassis(
            chassisRequest.chassisList.filterNotNull().toSet(),
            ScheduleStateEnum.REJECTED.state()
        )

        chassisRequest.chassisList.filterNotNull().forEach { chassis ->

            val checkupScheduleListForThis = checkupScheduleByChassis.filter {
                it.vehicleSchedule.vehicle.chassis == chassis
            }

            val countScope = checkCampaign(chassis, checkupScheduleListForThis)
            if(countScope > 0) {
                readyToScheduleChassis.add(chassis)
            }
        }

        return BigNumbersResponse(readyToScheduleChassis.size, readyToScheduleChassis)
    }

    private fun getFilteredCheckupsByAccountId(userRole: UserRole, userAuthenticate: UserAuthenticate, assetsIdsRequest: AssetIdsNullRequest): List<CheckupScheduleEntity> {
        val checkups = getCheckupScheduleByAccountIdAccordingRole(userAuthenticate, userRole)
        val checkupsFiltered = assetsIdsRequest.assetIds?.let { assetsIds ->
            checkups.filter { checkup ->
                assetsIds.any {
                    it == getAssetIdAccordingToRole(userRole, checkup)
                }
            }
        } ?: checkups
        return checkupsFiltered
    }

    private fun getFilteredCheckupsGroupedByAccountId(userAuthenticate: UserAuthenticate, assetsIdsRequest: AssetIdsNullRequest): Map<String?, List<CheckupScheduleEntity>> {
        val userRole = userRoleService.getRoleByUserId(userAuthenticate)
        val checkups = getCheckupScheduleByAccountIdAccordingRole(userAuthenticate, userRole)
        val groupedCheckupsByChassis = checkups.groupBy {
            getAssetIdAccordingToRole(userRole, it)
        }
        val checkupsFiltered = assetsIdsRequest?.assetIds?.let { assetsIds ->
            groupedCheckupsByChassis.filter { (assetId, checkup) ->
                assetsIds.any {
                    it == assetId
                }
            }
        } ?: groupedCheckupsByChassis
        return checkupsFiltered
    }

    private fun toVehicleParams(
        chassis: String,
        vehicleMetricsParam: VehicleMetrics?,
        checkupSchedule: List<CheckupSchedule>
    ): VehicleParams {
        return with(VehicleParams()) {
            this.chassis = chassis
            vehicleMetrics = VehicleMetrics().apply {
                odometer = vehicleMetricsParam?.odometer
                hourMeter = vehicleMetricsParam?.hourMeter
            }
            this
        }
    }

    private fun getCheckupScheduleByAccountIdAccordingRole(userAuthenticate:UserAuthenticate, userRole: UserRole) : List<CheckupScheduleEntity> {
        val accountId = userAuthenticate.accountId
        val checkups = when(userRole.role) {
            InviterType.TOWER.name -> checkupScheduleRepository.getCheckupScheduleByTowerAccountId(accountId)
            InviterType.MANAGER.name -> checkupScheduleRepository.getCheckupScheduleByAccountId(accountId)
            InviterType.CONSULTANT.name -> checkupFromConsultant(userAuthenticate)
            else -> throw IllegalArgumentException(inviterTypeNotExistsMessage())
        }
        return checkups
    }

    private fun inviterTypeNotExistsMessage(): String {
        return "The user must be on ${InviterType.entries.joinToString(", ") { it.name }}"
    }

    private fun checkupFromConsultant(userAuthenticate: UserAuthenticate): List<CheckupScheduleEntity> {
        val consultant = consultantsRepository.consultantById(userAuthenticate.userId)
        if (consultant != null) {
            return checkupScheduleRepository.getCheckupScheduleByDealershipId(consultant.dn)
        }
        throw BusinessException(ErrorCode.NO_CONSULTANT_FOUND.toResponse())
    }

    fun getTotalVehiclePastDueMaintenance(assetsRequest: AssetsRequest, usr: UserAuthenticate) : BigNumbersResponse {
        val pastDueChassisList = mutableListOf<String>()
        val allVehicleMetricList = assetMetricService.getMetricsByAssetIdList(
            assetsRequest.assets.map { it.id }
        )
        val allAssets = assetsRequest.assets.filter { it.identification != null }
        val assetsBatch = allAssets.chunked(50)
        val userRole = userRoleService.getRoleByUserId(usr)
        val allCheckupSchedules = getCheckupScheduleByAccountIdAccordingRole(usr, userRole)
        for(assetsPiece in assetsBatch) {
            pastDueChassisList.addAll(getPastDueByChassisList(assetsPiece, allVehicleMetricList, allCheckupSchedules))
        }
        return BigNumbersResponse(
            pastDueChassisList.size,
            pastDueChassisList
        )
    }

    private fun getPastDueByChassisList(
        assets: List<AssetBigNumberRequest>,
        allVehicleMetricList: List<AssetMetricEntity>,
        allCheckupSchedules: List<CheckupScheduleEntity>
    ): MutableList<String> {
        val vehicleInfoFromOdpList = odpDbService.getCheckupOdpByChassisList(assets.mapNotNull { it.identification })
        val pastDueChassis = mutableListOf<String>()
        for(asset in assets) {
            if(asset.identification == null) {
                continue
            }
            val vehicleInfoFromOdp = vehicleInfoFromOdpList.firstOrNull {
                it.chassis == asset.identification
            }
            val assetMetric = allVehicleMetricList.firstOrNull {
                it.assetId == asset.id
            }
            val checkupScheduleThisAsset = allCheckupSchedules.filter {
                it.id.toString() == asset.id
            }
            if(isCheckupLate(asset.identification, assetMetric, vehicleInfoFromOdp, checkupScheduleThisAsset)) {
                pastDueChassis.add(asset.identification)
            }
        }
        return pastDueChassis
    }

    private fun isCheckupLate(
        chassis: String,
        assetMetric: AssetMetricEntity?,
        vehiclesInfoFromOdp: CheckupOdpData?,
        checkupScheduleThisAsset: List<CheckupScheduleEntity>
    ) : Boolean {

        val maintenanceGroup = vehiclesInfoFromOdp?.maintenanceGroup
        val maintenanceGroupId = maintenanceGroup?.let { label ->
            MaintenanceGroupEnum.byMaintenanceGroupName(label)?.value()
        }

        //val lastOdometerRevision = vehiclesInfoFromOdp?.revisions?.maxOfOrNull { rev -> rev.mileage ?: 0 } ?: 0

        val isLate = checkVehicleServiceImpl.isLate(
            vehicleParams = VehicleParams().apply {
                this.chassis = chassis
                this.group = maintenanceGroupId
                this.vehicleMetrics = VehicleMetrics().apply {
                    this.odometer = assetMetric?.odometer
                    this.hourMeter = assetMetric?.hourMeter                }
            },
            checkupScheduleList = checkupScheduleThisAsset.map {
                CheckupScheduleConverter.checkupScheduleEntityToModel(it)
            },
        )
        return isLate
    }

    /* Deprecated: remove after 2025-07-14, replaced by OccurrenceController.getStats
    fun getVehiclesAvailableToScheduleByAccountId(userAuthenticate: UserAuthenticate, assetIdsRequest: AssetIdsNullRequest) : BigNumbersAssetsIdsResponse {

        val readyToScheduleChassis = mutableSetOf<String>()
        val selectedAssetIds = mutableSetOf<String>()

        val groupedCheckupsByChassis = getFilteredCheckupsGroupedByAccountId(userAuthenticate, assetIdsRequest)
        assetsDbRepository.getAllByAccountIdCallback(
            userAuthenticate.accountId
        ) { assetEntityList ->
            val odometers = odometerService.odometerHourMeterByAssetsId(
                assetEntityList.map { it.id }
            )
            val chassisList = assetEntityList.mapNotNull { it.identification }
            val vehicleOdpList = odpDbService.getCheckupOdpByChassisList(chassisList)
            for(assetEntity in assetEntityList) {
                val oneOdometer = odometers.firstOrNull {
                    it.assetId == assetEntity.id
                }
                if(oneOdometer == null) {
                    continue
                }
                val vehicleOdp = vehicleOdpList.firstOrNull {
                    it.chassis == assetEntity.identification
                }
                if(vehicleOdp == null) {
                    continue
                }
                val maintenanceGroup = vehicleOdp.maintenanceGroup
                if(maintenanceGroup == null) {
                    continue
                }
                val schedules = groupedCheckupsByChassis[assetEntity.id] ?: listOf()
                val next = checkVehicleServiceImpl.checkNearFiveKm(
                    vehicleParams = VehicleParams().apply {
                        this.vehicleMetrics = oneOdometer.vehicleMetrics
                        this.group = MaintenanceGroupEnum.byMaintenanceGroupName(maintenanceGroup)!!.value()
                        this.chassis = assetEntity.identification!!
                    },
                    schedules = schedules.map {
                        CheckupScheduleConverter.checkupScheduleEntityToModel(it)
                    },
                    latestOdometerRevision = BigDecimal.valueOf(vehicleOdp.revisions?.sortedByDescending { r ->  r.mileage }?.firstOrNull()?.mileage ?: 0).toDouble()
                )
                if(next != null) {
                    selectedAssetIds.add(assetEntity.id)
                    readyToScheduleChassis.add(assetEntity.identification!!)
                }
            }
        }

        return BigNumbersAssetsIdsResponse(
            selectedAssetIds.size,
            readyToScheduleChassis.toList(),
            selectedAssetIds.toList()
        )
    }

    fun getVehiclesByStatus(assetsRequest: VehicleStatusRequest) : VehicleStatusResponse  {
        try {

            val vehicleStatusResponse: VehicleStatusResponse
            val rioMaintenanceGatewayInMillis = measureTimeMillis {
                vehicleStatusResponse = rioMaintenanceGateway.getVehiclesByStatus(assetsRequest, userAuthServiceImpl.usr().accountId)
            }

            log.info("Consulta de veículos por status. Response time em $rioMaintenanceGatewayInMillis milisegundos.")
            return vehicleStatusResponse
        } catch (ex: Exception) {
            log.error("Falha ao obter Big Numbers de veículos em atenção por status.", ex)
        }

        return VehicleStatusResponse(data = emptyList(), total = 0)
    }

    fun getTotalVehicleWithRioPlan(assetIdsRequest: AssetIdsRequest) : BigNumbersResponse {
        val plans = planService.getPlansAndAssets()

        val assetIds = plans.flatMap { plan ->
            plan.periods.flatMap { period ->
            period.assets.map { it.assetId }
            }
        }.filter { it in assetIdsRequest.assetIds }.distinct()

        return BigNumbersResponse(assetIds.size, assetIds)
    }

    fun getTotalVehiclesInMaintenanceByAccountId(userAuthenticate: UserAuthenticate, assetsIdsRequest: AssetIdsNullRequest) : BigNumbersAssetsIdsResponse {
        val userRole = userRoleService.getRoleByUserId(userAuthenticate)
        val checkups = getFilteredCheckupsByAccountId(userRole, userAuthenticate, assetsIdsRequest)

        val chassisList = arrayListOf<String>()
        val selectedAssetIds = arrayListOf<String>()

        for(checkup in checkups) {
            val assetId = getAssetIdAccordingToRole(userRole, checkup)
            val maintenance = checkup.vehicleSchedule.maintenance
            if(maintenance != null && maintenance.statusId != StepType.FINISHED.name) {
                val chassis = checkup.chassis
                if(assetId != null) {
                    selectedAssetIds.add(assetId)
                }
                if(chassis != null) {
                    chassisList.add(chassis)
                }
            }
        }

        return BigNumbersAssetsIdsResponse(
            selectedAssetIds.size,
            chassisList,
            selectedAssetIds
        )
    }

    fun getTotalVehicleDelayedMaintenanceByAccountId(userAuthenticate: UserAuthenticate, assetsIdsRequest: AssetIdsNullRequest) : BigNumbersAssetsIdsResponse {
        val userRole = userRoleService.getRoleByUserId(userAuthenticate)
        val checkups = getFilteredCheckupsByAccountId(userRole, userAuthenticate, assetsIdsRequest)

        val chassisList = emptyList<String>().toMutableList()
        val selectedAssetIds = arrayListOf<String>()

        for(checkupSchedule in checkups) {
            val chassis = checkupSchedule.chassis
            val assetId = getAssetIdAccordingToRole(userRole, checkupSchedule)
            if (
                checkupSchedule.vehicleSchedule.maintenance == null &&
                checkupSchedule.schedule.scheduledDate.toLocalDate()?.atStartOfDay()?.isBefore(LocalDateTime.now()) == true
            ) {
                if(assetId != null) {
                    selectedAssetIds.add(assetId)
                }
                if(chassis != null) {
                    chassisList += chassis
                }
            }
        }

        return BigNumbersAssetsIdsResponse(
            selectedAssetIds.size,
            chassisList,
            selectedAssetIds
        )
    }

    fun getTotalVehiclesScheduledByAccountId(userAuthenticate: UserAuthenticate, assetsIdsRequest: AssetIdsNullRequest) : BigNumbersAssetsIdsResponse {

        val checkupsByAssetId = getFilteredCheckupsGroupedByAccountId(userAuthenticate, assetsIdsRequest)
        val chassisList = emptyList<String>().toMutableList()
        val selectedAssetIds = arrayListOf<String>()
        for((userAssetId, checkupsForThisAsset) in checkupsByAssetId) {
            val chassis = checkupsForThisAsset.firstOrNull()?.chassis
            val schedule = checkupsForThisAsset.firstOrNull {
                it.vehicleSchedule.maintenance == null
            }
            if (schedule != null) {
                if (userAssetId != null) {
                    selectedAssetIds.add(userAssetId)
                }
                if(chassis != null) {
                    chassisList.add(chassis)
                }
            }
        }
        return BigNumbersAssetsIdsResponse(
            selectedAssetIds.size,
            chassisList,
            selectedAssetIds
        )
    }
    */
}

data class BigNumbersResponse(val total: Int, val chassisList: List<String>? = null)
data class BigNumbersAssetsIdsResponse(
    val total: Int,
    val chassisList: List<String>? = null,
    val assetIds: List<String> = arrayListOf()
)
data class AvailableToScheduleBigNumber(
    val total: Int,
    val chassisList: List<String> = arrayListOf()
)
data class VehicleStatusResponse(val data: List<VehicleResponse>, val total: Int)
data class VehicleResponse(val vehicleId:String)
data class VehicleStatusRequest(
    val filterType: String,
    val pageSize: Long,
    val startAt: String,
    val endAt: String,
    val assetIds: List<String>,
    val page: Long,
)