package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.core.models.dealership.Dealership
import br.com.vw.uptime.schedule.core.models.dealership.DealershipFavoriteSaved
import br.com.vw.uptime.schedule.entrypoint.requests.DealershipRequest
import br.com.vw.uptime.schedule.infrastructure.services.dealership.DealershipServiceImpl
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/v1/dealerships")
class DealershipController(
    val dealershipServiceImpl: DealershipServiceImpl
) {

    private val log = LoggerFactory.getLogger(DealershipController::class.java)

    @GetMapping("")
    fun getDealerships(
        @RequestParam("city", required = true) city:String,
        @RequestParam("state", required = true) state:String,
        @RequestParam("name", required = false) name:String,
        @RequestParam("dn", required = false) dn:String
    ) : List<Dealership> {
        if(name.isNotEmpty() || dn.isNotEmpty()) {
            return dealershipServiceImpl.findDealerships(name, dn)
        }
        return dealershipServiceImpl.dealershipsByCity(city, state)
    }

    @GetMapping("/dn/{dn}")
    fun dealershipById(
        @PathVariable("dn") dn:String
    ) : Dealership {
        return dealershipServiceImpl.dealershipById(dn)
    }

    @GetMapping("/geo")
    fun dealershipsGeoLocation(@RequestParam("latitude", required = true) latitude:Double,
                               @RequestParam("longitude", required = true) longitude:Double,
                               @RequestParam("maxDistance", required = true) maxDistance:Double,
                               @RequestParam("limit", required = false,defaultValue = "5") limit: Int) : List<Dealership> {
        log.info("Busca de concessionárias para as coordenadas [{},{}] em um raio de [{}] km limitado a [{}] concessionárias", latitude, longitude, maxDistance, limit)
        return dealershipServiceImpl.dealershipsByLocation(latitude, longitude, maxDistance, limit)
    }

    @PostMapping("/favorites")
    fun favoriteDealership(@RequestBody dealershipRequest: DealershipRequest) : DealershipFavoriteSaved {
        return dealershipServiceImpl.favoriteDealership(dealershipRequest)
    }

    @GetMapping("/favorites")
    fun favoriteDealershipList() : List<Dealership> {
        return dealershipServiceImpl.favoriteDealershipList()
    }

}