package br.com.vw.uptime.schedule.infrastructure.repositories.occurrence

import br.com.vw.uptime.schedule.infrastructure.entities.occurence.ServiceBayScheduleEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime


@Repository
interface ServiceBayScheduleRepository : JpaRepository<ServiceBayScheduleEntity, String> {

    fun findByIdAndDnAndActive(id: String, dn: String, b: Boolean) : ServiceBayScheduleEntity?
    fun existsByOccurrenceIdAndDnAndActive(idOccurrence:Int, dn:String, active:Boolean) : Boolean
    @Query(
        nativeQuery = true,
        value = """
        SELECT EXISTS (
            SELECT 1
            FROM SERVICE_BAY_SCHEDULE s
            WHERE NOT (s.end_date <= :start OR s.start_date >= :end)
            and SERVICE_BAY_ID = :serviceBayId
            and active = true
        )
    """
    )
    fun hasConflict(
        @Param("serviceBayId") serviceBayId:String,
        @Param("start") start: LocalDateTime,
        @Param("end") end: LocalDateTime
    ): Boolean

    @Query(
        nativeQuery = true,
        value = """
            select
                *
            from
                SERVICE_BAY_SCHEDULE
            where
                (start_date between :startDate and :endDate)
                and dn = :dn
                and active = true
        """
    )
    fun findByRangeDates(
        startDate: LocalDateTime,
        endDate: LocalDateTime,
        dn: String
    ): List<ServiceBayScheduleEntity>

    @Query(
        nativeQuery = true,
        value = """
            select
                *
            from
                SERVICE_BAY_SCHEDULE
            where
                (start_date between :startDate and :endDate)
                and dn = :dn
                and active = true
                and service_bay_id IN (:serviceBayIds)
        """
    )
    fun findByRangeDatesWithServiceBays(
        startDate: LocalDateTime,
        endDate: LocalDateTime,
        dn: String,
        serviceBayIds:List<String>
    ): List<ServiceBayScheduleEntity>

    @Query(
        nativeQuery = true,
        value = """
            select
                *
            from
                SERVICE_BAY_SCHEDULE
            where
                dn = :dn
                and active = true
        """
    )
    fun findByDnAndActive(
        dn:String,
    ): List<ServiceBayScheduleEntity>
}