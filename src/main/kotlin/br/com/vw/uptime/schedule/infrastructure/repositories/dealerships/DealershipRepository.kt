package br.com.vw.uptime.schedule.infrastructure.repositories.dealerships

import br.com.vw.uptime.schedule.infrastructure.entities.dealership.DealershipEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface DealershipRepository : JpaRepository<DealershipEntity, String> {

    @Query("select d from DealershipEntity d where d.dn = :dn")
    fun findByDn(@Param("dn") dn:String) : DealershipEntity?

    @Query("select d from DealershipEntity d")
    fun getAll() : List<DealershipEntity>

    @Query("select d from DealershipEntity d where lower(d.fantasyName) like LOWER(CONCAT('%', :fantasyName, '%'))")
    fun findByFantasyName(@Param("fantasyName") fantasyName:String) : List<DealershipEntity>

    @Query("select d from DealershipEntity d where " +
           "(:name is not null and lower(d.fantasyName) like lower(concat('%', :name, '%'))) " +
           "or (:dn is not null and d.dn like concat('%', :dn, '%'))")
    fun find(
        @Param("name") name:String?,
        @Param("dn") dn:String?
    ) : List<DealershipEntity>
}

data class DealershipData(
    val dn: String,
    val fantasyName: String,
    val address: String,
    val city: String,
    val state: String?,
    val neighborhood: String?,
    val cep:String?,
    val latitude: Double,
    val longitude: Double,
    val areaCode: String?,
    val socialReason: String,
    val telephone: String,
    val whatsapp: String?,
    val website: String?,
    val distance: Double,
    val regional:String?,
    val cnpj:String?,
    val cell:String?,
    val representative:String?
)