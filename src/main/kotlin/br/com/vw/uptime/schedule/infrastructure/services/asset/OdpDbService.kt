package br.com.vw.uptime.schedule.infrastructure.services.asset

import br.com.vw.uptime.schedule.infrastructure.repositories.assets.*
import org.springframework.stereotype.Service

@Service
class OdpDbService(
    private val uptimeAssetRepository: UptimeAssetRepository,
) {

    fun getCheckupOdpByChassisList(chassis:List<String>): List<CheckupOdpData> {
        return uptimeAssetRepository.getUptimeAssetsByChassisList(chassis).filter { it.odp != null }
            .map {
            val odp = it.odp!!
            CheckupOdpData(
                it.chassis,
                maintenanceGroup = odp.maintenanceGroup,
                modelDescription = odp.modelDescription,
                modelCode = odp.modelCode,
                volkstotal = odp.volkstotal?.let { vt ->
                    VolksTotalData(
                        status = vt.status,
                        contractNumber = vt.contractNumber,
                        modality = vt.modality
                    )
                },
                warranty = odp.warranty?.let { wrt ->
                    WarrantyData(
                        start = wrt.start,
                        end = wrt.end,
                        generalStart = wrt.generalStart,
                        generalEnd = wrt.generalEnd,
                        additionalStart = wrt.additionalStart,
                        additionalEnd = wrt.additionalEnd,
                        specialStart = wrt.specialStart
                    )
                },
                order = odp.order?.let {
                    OrderData(
                        it.saleDate
                    )
                },
                revisions = odp.revisions?.let { revLst ->
                    revLst.map { rev ->
                        RevisionData(
                            volkscareRevision = rev.volkscareRevision,
                            hourMeter = rev.hourMeter,
                            mileage = rev.mileage,
                            revisionDate = rev.revisionDate,
                            dealer = rev.dealer,
                            consultantName = rev.consultantName,
                            revisionType = rev.revisionType,
                            revisionCode = rev.revisionCode,
                            serviceOrder = rev.serviceOrder
                        )
                    }
                }
            )
        }
    }

}