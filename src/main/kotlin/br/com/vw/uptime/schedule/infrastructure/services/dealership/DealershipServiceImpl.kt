package br.com.vw.uptime.schedule.infrastructure.services.dealership

import br.com.vw.uptime.schedule.core.converters.Mapping
import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.models.dealership.Dealership
import br.com.vw.uptime.schedule.core.models.dealership.DealershipFavorite
import br.com.vw.uptime.schedule.core.models.dealership.DealershipFavoriteSaved
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.requests.DealershipRequest
import br.com.vw.uptime.schedule.infrastructure.entities.dealership.DealershipEntity
import br.com.vw.uptime.schedule.infrastructure.entities.dealership.DealershipFavoriteEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.CheckupOdpRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.dealerships.DealershipData
import br.com.vw.uptime.schedule.infrastructure.repositories.dealerships.DealershipFavoriteRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.dealerships.DealershipRepository
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.text.Normalizer
import java.util.*

@Service
class DealershipServiceImpl(
    val dealershipFavoriteRepository: DealershipFavoriteRepository,
    val checkupOdpRepository: CheckupOdpRepository,
    val dealershipRepository:DealershipRepository,
    val usrSvc: UserAuthServiceImpl
) {

    private val log = LoggerFactory.getLogger(DealershipServiceImpl::class.java)

    companion object {
        fun getDealershipMocked(): DealershipData {
            return DealershipData(
                fantasyName = "Concessionaria VWCO",
                socialReason = "Volkswagen Truck & Bus Indústria e Comércio de Veículos Ltda.",
                dn = "182739",
                address = "AV. DR. LUIS ROCHA MIRANDA 341",
                neighborhood = "JABAQUARA",
                city = "São Paulo",
                state = "SP",
                cep = "04344-900",
                areaCode = "11",
                telephone = "0800 019 3333",
                whatsapp = "5582-5600",
                latitude = -23.63656598509437,
                longitude = -46.64459982639477,
                distance = 0.0,
                website = "https://www.vwco.com.br",
                representative = "Representative Volks",
                cnpj = "CNPJ VOLKS",
                regional = "99999",
                cell = "7777"
            )
        }
    }

    fun allDealershipsData(): List<DealershipData> {
        return checkupOdpRepository.getDealerships(
            -23.63656598509437, -46.64459982639477, 100000.0) + getDealershipMocked()
    }

    fun dealershipsByCity(city: String, state: String): List<Dealership> {
        val cityNorm = normalizeBrazilianText(city)
        val stateNorm = normalizeBrazilianText(state)
        val dealershipDataList = dealershipRepository.getAll()
        val dealershipDataListByCity = dealershipDataList.filter {
            it.city == cityNorm && it.state == stateNorm
        }
        val dealershipList = mapToDealership(dealershipDataListByCity)
        return dealershipList
    }

    fun dealershipsByLocation(latitude:Double, longitude:Double, distance:Double, limit: Int) : List<Dealership> {
        return checkupOdpRepository.getDealerships(latitude, longitude, distance)
            .filter { it.state != null }
            .take(limit)
            .map {
                log.info("Concessionária localizada [{}], coordenadas [{},{}] em uma distancia de [{}] km", it.fantasyName, it.longitude, it.latitude, it.distance)
                Mapping.copy(it, Dealership()).apply {
                    this.id = it.dn
                }
            } + Mapping.copy(getDealershipMocked(), Dealership()).apply { this.id = this.dn }
    }

    fun favoriteDealership(dealershipRequest: DealershipRequest) : DealershipFavoriteSaved {
        val selectedDealershipEntity = dealershipRepository.findByDn(dealershipRequest.id)
        val dealershipEntity = dealershipFavoriteRepository.getById(dealershipRequest.id, usrSvc.usr())
        if(dealershipEntity == null) {
            if(dealershipRequest.favorite) {
                if(selectedDealershipEntity == null) {
                    throw BusinessException(ErrorCode.NO_DEALERSHIP_AVAILABLE.toResponse())
                }
                return createNewDealership(dealershipRequest, selectedDealershipEntity)
            }
            return with(DealershipFavoriteSaved()){
                this.id = dealershipRequest.id
                this.favorite =  dealershipRequest.favorite
                this
            }
        }
        return updateDealership(dealershipRequest, dealershipEntity)
    }

    fun favoriteDealershipList(): List<DealershipFavorite> {
        val usr = usrSvc.usr()
        val dealershipEntityList = dealershipFavoriteRepository.listAll(usr)
        return dealershipEntityList.map { dealershipEntity ->
            with(Mapping.copy(dealershipEntity, DealershipFavorite())) {
                id = dealershipEntity.dealershipId
                found = false
                this
            }
        }
    }

    fun dealershipById(dealershipId:String) : Dealership {
        val dealershipEntity = dealershipRepository.findByDn(dealershipId)
        if(dealershipEntity == null) {
            throw BusinessException(ErrorCode.NO_DEALERSHIP_AVAILABLE.toResponse())
        }
        return dealershipEntityToDealership(dealershipEntity, null)
    }

    fun findDealerships(name:String?, dn:String?) : List<Dealership> {
        val dealershipEntity = dealershipRepository.find(name, dn)
        if(dealershipEntity == null) {
            return listOf()
        }
        return dealershipEntity.map { dealershipEntityToDealership(it, null) }
    }

    private fun createNewDealership(dealershipRequest: DealershipRequest, dealershipEntity: DealershipEntity): DealershipFavoriteSaved {
        val dealershipFavoriteEntity = dealershipEntityToFavoriteEntity(dealershipEntity, dealershipRequest.favorite)
        val dealershipEntityNew = dealershipFavoriteRepository.save(dealershipFavoriteEntity)
        return with(DealershipFavoriteSaved()){
            this.id = dealershipEntityNew.dealershipId
            this.favorite =  dealershipRequest.favorite
            this
        }
    }

    private fun dealershipEntityToFavoriteEntity(selectedDealershipData:DealershipEntity, favorite:Boolean) : DealershipFavoriteEntity {
        val user = usrSvc.usr()
        return with(DealershipFavoriteEntity()) {
            id = UUID.randomUUID().toString()
            accountId = user.accountId
            userId = user.userId
            dealershipId = selectedDealershipData.dn
            this.favorite = favorite
            fantasyName = selectedDealershipData.fantasyName
            state = selectedDealershipData.state
            city = selectedDealershipData.city
            website = selectedDealershipData.website ?: ""
            whatsapp = selectedDealershipData.whatsapp ?: ""
            instagram = ""
            cep = selectedDealershipData.cep ?: ""
            telephone = selectedDealershipData.telephone
            address = selectedDealershipData.address
            neighborhood = selectedDealershipData.neighborhood ?: ""
            latitude = selectedDealershipData.latitude ?: 0.0
            longitude = selectedDealershipData.longitude ?: 0.0
            this
        }
    }

    private fun updateDealership(dealershipRequest: DealershipRequest, dealershipEntity: DealershipFavoriteEntity): DealershipFavoriteSaved {
        dealershipEntity.favorite = dealershipRequest.favorite
        val dealershipEntityNew = dealershipFavoriteRepository.save(dealershipEntity)
        return with(DealershipFavoriteSaved()) {
            this.id = dealershipEntityNew.dealershipId
            this.favorite = dealershipEntityNew.favorite
            this
        }
    }



    private fun normalizeBrazilianText(input: String): String {
        // Normalize the text to decompose accented characters
        val normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
        // Remove all diacritical marks (characters in the Unicode category "Mark")
        return normalized.replace(Regex("\\p{M}"), "")
    }



    private fun mapToDealership(dealershipDataList: List<DealershipEntity>): List<Dealership> {
        val dealershipList = arrayListOf<Dealership>()
        for(dealershipData in dealershipDataList) {
            val dealershipEntity = dealershipFavoriteRepository.getById(dealershipData.dn, usrSvc.usr())
            dealershipList.add(
                dealershipEntityToDealership(dealershipData, dealershipEntity)
            )
        }
        return dealershipList
    }

    fun dealershipEntityToDealership(dealershipEntity: DealershipEntity, favoriteDealershipEntity: DealershipFavoriteEntity?) : Dealership {
        return with(Dealership()){
            this.id = dealershipEntity.dn
            this.fantasyName = dealershipEntity.fantasyName
            this.city = dealershipEntity.city
            this.state = dealershipEntity.state ?: ""
            this.neighborhood = dealershipEntity.neighborhood ?: ""
            this.address = dealershipEntity.address
            this.telephone = dealershipEntity.telephone
            this.cep = dealershipEntity.cep ?: ""
            this.whatsapp = dealershipEntity.whatsapp ?: ""
            this.website = dealershipEntity.website ?: ""
            this.instagram = ""
            this.latitude = dealershipEntity.latitude ?: 0.0
            this.longitude = dealershipEntity.longitude ?: 0.0
            this.favorite  = favoriteDealershipEntity?.favorite ?: false
            this.regional = dealershipEntity.regional ?: ""
            this.areaCode = dealershipEntity.areaCode ?: ""
            this.cnpj = dealershipEntity.cnpj
            this.cell = dealershipEntity.cell
            this.representative = dealershipEntity.representative
            this
        }
    }
}