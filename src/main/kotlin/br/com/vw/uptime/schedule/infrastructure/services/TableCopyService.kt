package br.com.vw.uptime.schedule.infrastructure.services

import br.com.vw.uptime.schedule.core.converters.Mapping
import br.com.vw.uptime.schedule.infrastructure.entities.dealership.DealershipEntity
import br.com.vw.uptime.schedule.infrastructure.gateway.PlatformNotificationGateway
import br.com.vw.uptime.schedule.infrastructure.repositories.dealerships.DealershipRepository
import br.com.vw.uptime.schedule.infrastructure.services.dealership.DealershipServiceImpl
import jakarta.persistence.EntityManagerFactory
import jakarta.persistence.RollbackException
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class TableCopyService(
    private val entityManagerFactory: EntityManagerFactory,
    private val dealershipRepository: DealershipRepository,
    private val dealershipServiceImpl: DealershipServiceImpl
) {

    val log = LoggerFactory.getLogger(PlatformNotificationGateway::class.java)


    fun putItemsInBatch(
        items: List<DealershipEntity>,
        feedback:(count:Int) -> Unit
    ) {
        val entityManager = entityManagerFactory.createEntityManager()
        try {
            items.chunked(25).forEach { chunk ->
                val tx = entityManager.transaction

                try {
                    tx.begin()
                    chunk.forEach { item ->
                        entityManager.merge(item)
                    }
                    tx.commit()
                } catch (e: RollbackException) {
                    tx.rollback()
                    throw e
                }

                feedback(chunk.size)
            }
        } finally {
            entityManager.close()
        }
    }

    fun dealershipToDataBase() {
        var count = 0
        val eachInit = 100
        var each = 0
        val dealershipSheetList = getAllDealershipSheet()
        val dealershipSheetRepresentativeList = getAllDealershipSheetRepresentative()

        val dealershipList = dealershipServiceImpl.allDealershipsData()

        val dealershipEntityList = arrayListOf<DealershipEntity>()

        for(dealership in dealershipList) {
            val dealershipEntity = Mapping.copy(dealership, DealershipEntity())
            val dealershipSheet = dealershipSheetList.firstOrNull {
                it.dn == dealership.dn
            }
            val dealershipSheetRepresentative = dealershipSheetRepresentativeList.firstOrNull {
                it.dn == dealership.dn
            }

            dealershipSheet?.let { dnSheet ->

                dealershipEntity.regional = dnSheet.regional
                dealershipEntity.cell = dnSheet.celula
                dealershipEntity.cnpj = dnSheet.cnpj

            }
            dealershipSheetRepresentative?.let { dealershipRepr ->
                dealershipEntity.representative = dealershipRepr.name
            }

            dealershipEntityList.add(dealershipEntity)
        }

        putItemsInBatch(dealershipEntityList) { processedCount ->
            count += processedCount
            if(count >= each) {
                each += eachInit
                log.info("Processed at this moment: $count")
            }
        }

        log.info("Data copy table finished")
    }

    fun getAllDealershipSheet(): List<DealershipSheet> {
        val filePath = "tmp/planilha_concessionarias.xlsx"
        val list = arrayListOf<DealershipSheet>()
        TableCopyService::class.java.classLoader.getResourceAsStream(filePath).use { fis ->
            val workbook = XSSFWorkbook(fis)
            val sheet = workbook.getSheetAt(0)
            for (row in sheet.drop(4)) { // Skip header

                val dealershipSheet = DealershipSheet(
                    dn = row.getCell(0)?.numericCellValue?.toInt()?.toString(),
                    matriz = row.getCell(1)?.numericCellValue?.toInt()?.toString(),
                    regional = row.getCell(2)?.numericCellValue?.toInt()?.toString(),
                    celula = row.getCell(3)?.numericCellValue?.toInt()?.toString(),
                    uf = row.getCell(8)?.toString()?.trim(),
                    cnpj = row.getCell(14).stringCellValue
                )
                list.add(dealershipSheet)
            }
            workbook.close()
        }
        return list
    }



    fun getAllDealershipSheetRepresentative(): List<DealershipSheetRepresentative> {
        val filePath = "tmp/email_gestor_de_concessionaria.xlsx"
        val list = arrayListOf<DealershipSheetRepresentative>()
        TableCopyService::class.java.classLoader.getResourceAsStream(filePath).use { fis ->
            val workbook = XSSFWorkbook(fis)
            val sheet = workbook.getSheetAt(1)

            for (row in sheet.drop(1)) { // Skip header

                val dealershipSheet = DealershipSheetRepresentative(
                    dn = row.getCell(0)?.toString()?.replace(".0", ""),
                    name = row.getCell(1)?.toString()?.trim()
                )
                list.add(dealershipSheet)
            }
            workbook.close()
        }
        return list
    }

}

data class DealershipSheet(
    val dn:String?,
    val celula:String?,
    val regional:String?,
    val matriz:String?,
    val uf:String?,
    val cnpj:String?,
)

data class DealershipSheetRepresentative(
    val dn:String?,
    val name:String? = null
)