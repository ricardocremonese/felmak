package br.com.vw.uptime.schedule.infrastructure.repositories.occurrence

import br.com.vw.uptime.schedule.infrastructure.entities.occurence.OccurrenceEntity
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.analytics.*
import br.com.vw.uptime.schedule.infrastructure.services.occurence.StepTypeOccurrence
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.time.LocalDateTime


@Repository
interface OccurrenceRepository : JpaRepository<OccurrenceEntity, Int> {

    @Query("select oc from OccurrenceEntity oc where oc.uuid = :uuid")
    fun getOccurrenceByUuid(@Param("uuid") uuid:String) : OccurrenceEntity?

    @Query("select oc from OccurrenceEntity oc where oc.vehicle.chassis = :chassis")
    fun getOccurrenceByChassis(@Param("chassis") chassis:String) : OccurrenceEntity?

    @Query("select oc from OccurrenceEntity oc where oc.osNumber = :osNumber")
    fun getOccurrenceByOsNumber(@Param("osNumber") osNumber: String?) : OccurrenceEntity?

    fun findByUuidAndOccurrenceStepsStepId(occurrenceUuid: String, step: StepTypeOccurrence): OccurrenceEntity?

    @Query("SELECT oc FROM OccurrenceEntity oc WHERE oc.createdAt >= :startTime AND oc.createdAt <= :endTime AND oc.occurrenceSteps IS EMPTY")
    fun findScheduledOccurrencesWithoutSteps(@Param("startTime") startTime: LocalDateTime, @Param("endTime") endTime: LocalDateTime): List<OccurrenceEntity>

    @Query(
        """SELECT 
            DISTINCT oc.*
            FROM occurrence oc
            INNER JOIN occurrence_vehicle ov on oc.id = ov.id_occurrence
            INNER JOIN occurrence_dealership od on oc.id = od.id_occurrence
            LEFT JOIN service_bay_schedule sbs on (oc.id = sbs.id_occurrence and sbs.active = true)
            LEFT JOIN service_bay sb on sbs.service_bay_id = sb.id
            WHERE (:finished is null or (:finished = true and oc.end_date is not null) or (:finished = false and oc.end_date is null))
            AND (:accountUuid is null or oc.account_uuid = :accountUuid)
            AND (cast(:createdStartAt as date) is null or date(oc.created_at) BETWEEN cast(:createdStartAt as date) AND cast(:createdEndAt as date))
            AND (cast(:updatedStartAt as date) is null or date(oc.updated_at) BETWEEN cast(:updatedStartAt as date) AND cast(:updatedEndAt as date))
            AND (:criticality is null or oc.criticality = :criticality)
            AND (:partnerId is null or oc.partner_id = :partnerId)
            AND (:chassisEmpty = true or ov.chassis IN (:chassis))
            AND (:dn is null or od.dn = :dn)
            AND (:occurrenceType is null or :occurrenceType = '' or oc.occurence_type = ANY(string_to_array(:occurrenceType, ',')))
            AND (:createdByUuid is null or oc.created_by_uuid = :createdByUuid)
            AND (:dealershipDnEmpty = true or od.dn IN (:dealershipDn))
            AND (
                :isAlert = false or exists(
                    select
                        1
                    from
                    (
                        select
                            *
                        from
                            occurrence_step os
                            inner join step st on st.id = os.id_step
                        where
                            os.id_occurrence = oc.id
                            and oc.end_date is null
                        order by
                            os.dt_start desc
                        limit 1
                    ) as current_step
                    where
                        current_step.dt_start < current_timestamp - (current_step.hours_elapsed * INTERVAL '1 hour')
                )
            )
            AND (:hasCampaigns is null or oc.has_campaigns = :hasCampaigns) 
            AND (:step is null or (EXISTS (SELECT 1 FROM occurrence_step os WHERE os.id_occurrence = oc.id AND os.id_step = :step AND os.dt_end IS NULL))) 
            ORDER BY oc.criticality DESC
            LIMIT :size OFFSET :offset
        """,
        nativeQuery = true
    )
    fun listOccurrencesWithFilter(
        @Param("size") size: Int,
        @Param("offset") offset: Int,
        @Param("accountUuid") accountUuid: String?,
        @Param("chassis") chassis: List<String>,
        @Param("chassisEmpty") chassisEmpty: Boolean,
        @Param("occurrenceType") occurrenceType: String?,
        @Param("criticality") criticality: Int?,
        @Param("partnerId") partnerId: String?,
        @Param("createdStartAt") createdStartAt: LocalDate?,
        @Param("createdEndAt") createdEndAt: LocalDate?,
        @Param("updatedStartAt") updatedStartAt: LocalDate?,
        @Param("updatedEndAt") updatedEndAt: LocalDate?,
        @Param("dn") dn: String?,
        @Param("createdByUuid") createdByUuid: String?,
        @Param("dealershipDn") dealershipDn: List<String>,
        @Param("dealershipDnEmpty") dealershipDnEmpty: Boolean,
        @Param("hasCampaigns") hasCampaigns: Boolean?,
        @Param("isAlert") isAlert:Boolean = false,
        @Param("finished") finished: Boolean?,
        @Param("step") step: String?
    ) : List<OccurrenceEntity>



    @Query("SELECT "
            + "fo.* "
            + "FROM (select distinct fo.uuid from finished_occurrences fo LIMIT :size OFFSET :offset) as oc "
            + "INNER JOIN finished_occurrences fo ON oc.uuid = fo.uuid "
            + "WHERE (:accountUuid is null or fo.account_uuid = :accountUuid) "
            + "AND (cast(:createdStartAt as date) is null or fo.created_at BETWEEN cast(:createdStartAt as date) AND cast(:createdEndAt as date)) "
            + "AND (cast(:updatedStartAt as date) is null or fo.updated_at BETWEEN cast(:updatedStartAt as date) AND cast(:updatedEndAt as date)) "
            + "AND (:criticality is null or fo.criticality = :criticality) "
            + "AND (:partnerId is null or fo.partner_id = :partnerId) "
            + "AND (:chassisEmpty = true or fo.chassis IN (:chassisList)) "
            + "AND (:occurrenceType is null or :occurrenceType = '' or fo.occurence_type = ANY(string_to_array(:occurrenceType, ','))) "
            + "AND (:dn is null or fo.dn = :dn) ", nativeQuery = true)
    fun listFinishedOccurrencesWithFilter(@Param("size") size: Int,
                                          @Param("offset") offset: Int,
                                          @Param("accountUuid") accountUuid: String?,
                                          @Param("chassisList") chassis: List<String>,
                                          @Param("chassisEmpty") chassisEmpty: Boolean,
                                          @Param("occurrenceType") occurrenceType: String?,
                                          @Param("criticality") criticality: Int?,
                                          @Param("partnerId") partnerId: String?,
                                          @Param("createdStartAt") createdStartAt: LocalDate?,
                                          @Param("createdEndAt") createdEndAt: LocalDate?,
                                          @Param("updatedStartAt") updatedStartAt: LocalDate?,
                                          @Param("updatedEndAt") updatedEndAt: LocalDate?,
                                          @Param("dn") dn: String?) : List<FinishedOccurrence>

    @Query("""
        SELECT 
            os.id_step step,
            CAST(os.dt_start AS date) date,
            COUNT(DISTINCT oc.id) amount,
            array_agg(distinct ov.chassis) as chassis_list,
            array_agg(distinct oc.uuid) as occurrence_uuid_list
        FROM occurrence oc
            INNER JOIN occurrence_vehicle ov ON oc.id = ov.id_occurrence
            INNER JOIN occurrence_step os ON oc.id = os.id_occurrence
            INNER JOIN occurrence_dealership od ON oc.id = od.id_occurrence
        WHERE
            os.latest = 1
            and os.dt_end is null
            AND (oc.end_date is null)
            AND (:accountUuid is null or oc.account_uuid = :accountUuid)
            AND (cast(:createdStartAt as date) is null or date(oc.created_at) BETWEEN cast(:createdStartAt as date) AND cast(:createdEndAt as date))
            AND (cast(:updatedStartAt as date) is null or date(oc.updated_at) BETWEEN cast(:updatedStartAt as date) AND cast(:updatedEndAt as date))
            AND (:criticality is null or oc.criticality = :criticality)
            AND (:partnerId is null or oc.partner_id = :partnerId)
            AND (:chassisEmpty = true or ov.chassis IN (:chassisList))
            AND (:dn is null or od.dn = :dn)
            AND (:occurrenceType is null or :occurrenceType = '' or oc.occurence_type = ANY(string_to_array(:occurrenceType, ',')))
            AND (:createdByUuid is null or oc.created_by_uuid = :createdByUuid)
            AND (:dealershipDnEmpty = true or od.dn IN (:dealershipDn))
            AND (:hasCampaigns is null or oc.has_campaigns = :hasCampaigns)
        GROUP BY
            oc.id,
            CAST(os.dt_start AS date),
            os.id_step
        """
        , nativeQuery = true)
    fun calculateOccurrenceInProgress(@Param("accountUuid") accountUuid: String?,
                                      @Param("chassisList") chassisList: List<String>,
                                      @Param("chassisEmpty") chassisEmpty:Boolean,
                                      @Param("criticality") criticality: Int?,
                                      @Param("partnerId") partnerId: String?,
                                      @Param("createdStartAt") createdStartAt: LocalDate?,
                                      @Param("createdEndAt") createdEndAt: LocalDate?,
                                      @Param("updatedStartAt") updatedStartAt: LocalDate?,
                                      @Param("updatedEndAt") updatedEndAt: LocalDate?,
                                      @Param("dn") dn: String?,
                                      @Param("occurrenceType") occurrenceType: String?,
                                      @Param("createdByUuid") createdByUuid: String?,
                                      @Param("dealershipDn") dealershipDn: List<String>,
        @Param("dealershipDnEmpty") dealershipDnEmpty: Boolean,
                                      @Param("hasCampaigns") hasCampaigns: Boolean?) : List<OccurrenceQuantity>

    @Query("SELECT "
            + "os.id_step step, "
            + "CAST(os.dt_start AS date) date, "
            + "COUNT(DISTINCT oc.id) amount, "
            + "array_agg(distinct ov.chassis) as chassis_list, "
            + "array_agg(distinct oc.uuid) as occurrence_uuid_list "
            + "FROM occurrence oc "
            + "INNER JOIN occurrence_vehicle ov ON oc.id = ov.id_occurrence "
            + "INNER JOIN occurrence_step os ON oc.id = os.id_occurrence "
            + "INNER JOIN occurrence_dealership od ON oc.id = od.id_occurrence "
            + "WHERE (:finished is null or (:finished = true and oc.end_date is not null) or (:finished = false and oc.end_date is null)) "
            + "AND (:accountUuid is null or oc.account_uuid = :accountUuid) "
            + "AND (cast(:createdStartAt as date) is null or date(oc.created_at) BETWEEN cast(:createdStartAt as date) AND cast(:createdEndAt as date)) "
            + "AND (cast(:updatedStartAt as date) is null or date(oc.updated_at) BETWEEN cast(:updatedStartAt as date) AND cast(:updatedEndAt as date)) "
            + "AND (:criticality is null or oc.criticality = :criticality) "
            + "AND (:partnerId is null or oc.partner_id = :partnerId) "
            + "AND (:chassisEmpty = true or ov.chassis IN (:chassisList)) "
            + "AND (:dn is null or od.dn = :dn) "
            + "AND (:occurrenceType is null or :occurrenceType = '' or oc.occurence_type = ANY(string_to_array(:occurrenceType, ','))) "
            + "AND (:createdByUuid is null or oc.created_by_uuid = :createdByUuid) "
            + "AND (:dealershipDnEmpty = true or od.dn IN (:dealershipDn)) "
            + "AND (:hasCampaigns is null or oc.has_campaigns = :hasCampaigns) "
            + "GROUP BY oc.id, CAST(os.dt_start AS date), os.id_step"
        , nativeQuery = true)
    fun calculateOccurrenceFinished(@Param("accountUuid") accountUuid: String?,
                            @Param("chassisList") chassisList: List<String>,
                            @Param("chassisEmpty") chassisEmpty:Boolean,
                            @Param("criticality") criticality: Int?,
                            @Param("partnerId") partnerId: String?,
                            @Param("createdStartAt") createdStartAt: LocalDate?,
                            @Param("createdEndAt") createdEndAt: LocalDate?,
                            @Param("updatedStartAt") updatedStartAt: LocalDate?,
                            @Param("updatedEndAt") updatedEndAt: LocalDate?,
                            @Param("dn") dn: String?,
                            @Param("occurrenceType") occurrenceType: String?,
                            @Param("createdByUuid") createdByUuid: String?,
                            @Param("dealershipDn") dealershipDn: List<String>,
        @Param("dealershipDnEmpty") dealershipDnEmpty: Boolean,
                            @Param("hasCampaigns") hasCampaigns: Boolean?,
                            @Param("finished") finished: Boolean?) : List<OccurrenceQuantity>

    @Query("SELECT "
            + "os.id_step step, "
            + "COALESCE(sanitize(name), ov.chassis) vehicle, "
            + "EXTRACT(EPOCH FROM AVG(COALESCE(os.dt_end, current_timestamp) - os.dt_start)) / 60 average_time "
            + "FROM occurrence oc "
            + "INNER JOIN occurrence_vehicle ov ON oc.id = ov.id_occurrence "
            + "INNER JOIN occurrence_step os ON oc.id = os.id_occurrence "
            + "INNER JOIN occurrence_dealership od ON oc.id = od.id_occurrence "
            + "WHERE (:finished is null or (:finished = true and oc.end_date is not null) or (:finished = false and oc.end_date is null)) "
            + "AND (:accountUuid is null or oc.account_uuid = :accountUuid) "
            + "AND (cast(:createdStartAt as date) is null or date(oc.created_at) BETWEEN cast(:createdStartAt as date) AND cast(:createdEndAt as date)) "
            + "AND (cast(:updatedStartAt as date) is null or date(oc.updated_at) BETWEEN cast(:updatedStartAt as date) AND cast(:updatedEndAt as date)) "
            + "AND (:criticality is null or oc.criticality = :criticality) "
            + "AND (:partnerId is null or oc.partner_id = :partnerId) "
            + "AND (:chassisEmpty = true or ov.chassis IN (:chassisList)) "
            + "AND (:dn is null or od.dn = :dn) "
            + "AND (:occurrenceType is null or :occurrenceType = '' or oc.occurence_type = ANY(string_to_array(:occurrenceType, ','))) "
            + "AND (:createdByUuid is null or oc.created_by_uuid = :createdByUuid) "
            + "AND (:dealershipDnEmpty = true or od.dn IN (:dealershipDn)) "
            + "AND (:hasCampaigns is null or oc.has_campaigns = :hasCampaigns) "
            + "GROUP BY os.id_step, COALESCE(sanitize(name), ov.chassis)"
        , nativeQuery = true)
    fun calculateAverageTime(@Param("accountUuid") accountUuid: String?,
                             @Param("chassisList") chassisList: List<String>,
                             @Param("chassisEmpty") chassisEmpty:Boolean,
                            @Param("criticality") criticality: Int?,
                             @Param("partnerId") partnerId: String?,
                            @Param("createdStartAt") createdStartAt: LocalDate?,
                            @Param("createdEndAt") createdEndAt: LocalDate?,
                            @Param("updatedStartAt") updatedStartAt: LocalDate?,
                            @Param("updatedEndAt") updatedEndAt: LocalDate?,
                            @Param("dn") dn: String?,
                            @Param("occurrenceType") occurrenceType: String?,
                            @Param("createdByUuid") createdByUuid: String?,
                            @Param("dealershipDn") dealershipDn: List<String>,
        @Param("dealershipDnEmpty") dealershipDnEmpty: Boolean,
                            @Param("hasCampaigns") hasCampaigns: Boolean?,
                            @Param("finished") finished: Boolean?) : List<OccurrenceAverageTime>



    @Query("SELECT "
            + "coalesce(d1.fantasy_name, 'Total') as fantasy_name, "
            + "od.dn as dn, "
            + "COUNT(DISTINCT oc.id)as total, "
            + "coalesce(EXTRACT(EPOCH FROM AVG(coalesce(os.dt_end, current_timestamp) - os.dt_start)) / 60, 0) as averageTime, "
            + "array_agg(distinct ov.chassis) as chassis_list "
            + "FROM occurrence oc "
            + "INNER JOIN occurrence_step os ON oc.id = os.id_occurrence "
            + "INNER JOIN occurrence_vehicle ov ON oc.id = ov.id_occurrence "
            + "INNER JOIN occurrence_dealership od ON oc.id = od.id_occurrence "
            + "INNER JOIN dealership d1 on od.dn = d1.dn "
            + "WHERE oc.end_date IS null and d1.fantasy_name is not null "
            + "AND (:accountUuid is null or oc.account_uuid = :accountUuid) "
            + "AND (cast(:createdStartAt as date) is null or date(oc.created_at) BETWEEN cast(:createdStartAt as date) AND cast(:createdEndAt as date)) "
            + "AND (cast(:updatedStartAt as date) is null or date(oc.updated_at) BETWEEN cast(:updatedStartAt as date) AND cast(:updatedEndAt as date)) "
            + "AND (:criticality is null or oc.criticality = :criticality) "
            + "AND (:chassis is null or ov.chassis = :chassis) "
            + "AND (:dn is null or od.dn = :dn) "
            + "AND (:step is null or os.id_step = :step) "
            + "AND (:vehicle is null or ov.model = :vehicle) "
            + "AND (:em is null or ov.emission_standard = :em) "
            + "AND (:state is null or d1.state = :state) "
            + "AND (:city is null or d1.city = :city) "
            + "GROUP BY rollup(d1.fantasy_name, od.dn)", nativeQuery = true)
    fun calculateStatsByDealership(@Param("accountUuid") accountUuid: String?,
                                 @Param("chassis") chassis: String?,
                                 @Param("criticality") criticality: Int?,
                                 @Param("createdStartAt") createdStartAt: LocalDate?,
                                 @Param("createdEndAt") createdEndAt: LocalDate?,
                                 @Param("updatedStartAt") updatedStartAt: LocalDate?,
                                 @Param("updatedEndAt") updatedEndAt: LocalDate?,
                                 @Param("dn") dn: String?,
                                 @Param("step") step: String?,
                                 @Param("vehicle") vehicle: String?,
                                 @Param("em") em: String?,
                                 @Param("state") state: String?,
                                 @Param("city") city: String?,) : List<StatsByDealership>?

    @Query("SELECT "
            + "oc.* "
            + "FROM occurrence oc "
            + "INNER JOIN occurrence_vehicle ov on oc.id = ov.id_occurrence "
            + "INNER JOIN occurrence_dealership od on oc.id = od.id_occurrence "
            + "LEFT JOIN service_bay_schedule sbs on oc.id = sbs.id_occurrence "
            + "LEFT JOIN service_bay sb on sbs.service_bay_id = sb.id "
            + "WHERE (:dn is null or od.dn = :dn) "
            + "AND (:scheduleIdsEmpty = true or oc.schedule_uuid IN (:scheduleIds)) "
            + "ORDER BY oc.criticality DESC "
            + "LIMIT 1000", nativeQuery = true)
    fun listOccurrencesWithFilterAndScheduleIds(
        @Param("dn") dn: String?,
        @Param("scheduleIds") scheduleIds: List<String>,
        @Param("scheduleIdsEmpty") scheduleIdsEmpty: Boolean
    ) : List<OccurrenceEntity>



    @Query("SELECT "
            + "COUNT(DISTINCT oc.uuid) as total_occurrences "
            + "FROM occurrence oc "
            + "INNER JOIN occurrence_vehicle ov on oc.id = ov.id_occurrence "
            + "INNER JOIN occurrence_dealership od on oc.id = od.id_occurrence "
            + "LEFT JOIN occurrence_step os on oc.id = os.id_occurrence "
            + "LEFT JOIN service_bay_schedule sbs on (oc.id = sbs.id_occurrence and sbs.active = true) "
            + "LEFT JOIN service_bay sb on sbs.service_bay_id = sb.id "
            + "WHERE (:finished is null or (:finished = true and oc.end_date is not null) or (:finished = false and oc.end_date is null)) "
            + "AND (:accountUuid is null or oc.account_uuid = :accountUuid) "
            + "AND (cast(:createdStartAt as date) is null or date(oc.created_at) BETWEEN cast(:createdStartAt as date) AND cast(:createdEndAt as date)) "
            + "AND (cast(:updatedStartAt as date) is null or date(oc.updated_at) BETWEEN cast(:updatedStartAt as date) AND cast(:updatedEndAt as date)) "
            + "AND (:criticality is null or oc.criticality = :criticality) "
            + "AND (:partnerId is null or oc.partner_id = :partnerId) "
            + "AND (:chassisEmpty = true or ov.chassis IN (:chassis)) "
            + "AND (:dn is null or od.dn = :dn) "
            + "AND (:occurrenceType is null or :occurrenceType = '' or oc.occurence_type = ANY(string_to_array(:occurrenceType, ','))) "
            + "AND (:createdByUuid is null or oc.created_by_uuid = :createdByUuid) "
            + "AND (:dealershipDnEmpty = true or od.dn IN (:dealershipDn)) "
            + "AND (:hasCampaigns is null or oc.has_campaigns = :hasCampaigns) "
            + "AND (:step is null or (os.id_step = :step AND os.dt_end IS NULL))", nativeQuery = true)
    fun countOccurrences(
        @Param("accountUuid") accountUuid: String?,
        @Param("chassis") chassis: List<String>,
        @Param("chassisEmpty") chassisEmpty: Boolean,
        @Param("occurrenceType") occurrenceType: String?,
        @Param("criticality") criticality: Int?,
        @Param("partnerId") partnerId: String?,
        @Param("createdStartAt") createdStartAt: LocalDate?,
        @Param("createdEndAt") createdEndAt: LocalDate?,
        @Param("updatedStartAt") updatedStartAt: LocalDate?,
        @Param("updatedEndAt") updatedEndAt: LocalDate?,
        @Param("dn") dn: String?,
        @Param("createdByUuid") createdByUuid: String?,
        @Param("dealershipDn") dealershipDn: List<String>,
        @Param("dealershipDnEmpty") dealershipDnEmpty: Boolean,
        @Param("hasCampaigns") hasCampaigns: Boolean?,
        @Param("finished") finished: Boolean?,
        @Param("step") step: String?
    ) : Long

    @Query("SELECT "
            + "COUNT(DISTINCT oc.uuid) as total_occurrences, "
            + "COALESCE(SUM(DISTINCT EXTRACT(EPOCH FROM (COALESCE(os.dt_end, CURRENT_TIMESTAMP) - os.dt_start)) / 60), 0) as total_minutes "
            + "FROM occurrence oc "
            + "INNER JOIN occurrence_vehicle ov on oc.id = ov.id_occurrence "
            + "INNER JOIN occurrence_dealership od on oc.id = od.id_occurrence "
            + "INNER JOIN occurrence_step os on oc.id = os.id_occurrence "
            + "LEFT JOIN service_bay_schedule sbs on (oc.id = sbs.id_occurrence and sbs.active = true) "
            + "LEFT JOIN service_bay sb on sbs.service_bay_id = sb.id "
            + "WHERE (:finished is null or (:finished = true and oc.end_date is not null) or (:finished = false and oc.end_date is null)) "
            + "AND (:accountUuid is null or oc.account_uuid = :accountUuid) "
            + "AND (cast(:createdStartAt as date) is null or date(oc.created_at) BETWEEN cast(:createdStartAt as date) AND cast(:createdEndAt as date)) "
            + "AND (cast(:updatedStartAt as date) is null or date(oc.updated_at) BETWEEN cast(:updatedStartAt as date) AND cast(:updatedEndAt as date)) "
            + "AND (:criticality is null or oc.criticality = :criticality) "
            + "AND (:partnerId is null or oc.partner_id = :partnerId) "
            + "AND (:chassisEmpty = true or ov.chassis IN (:chassis)) "
            + "AND (:dn is null or od.dn = :dn) "
            + "AND (:occurrenceType is null or :occurrenceType = '' or oc.occurence_type = ANY(string_to_array(:occurrenceType, ','))) "
            + "AND (:createdByUuid is null or oc.created_by_uuid = :createdByUuid) "
            + "AND (:dealershipDnEmpty = true or od.dn IN (:dealershipDn)) "
            + "AND (:hasCampaigns is null or oc.has_campaigns = :hasCampaigns) "
            + "AND (:step is null or (os.id_step = :step AND os.dt_end IS NULL))", nativeQuery = true)
    fun getInProgressOccurrencesStats(
        @Param("accountUuid") accountUuid: String?,
        @Param("chassis") chassis: List<String>,
        @Param("chassisEmpty") chassisEmpty: Boolean,
        @Param("occurrenceType") occurrenceType: String?,
        @Param("criticality") criticality: Int?,
        @Param("partnerId") partnerId: String?,
        @Param("createdStartAt") createdStartAt: LocalDate?,
        @Param("createdEndAt") createdEndAt: LocalDate?,
        @Param("updatedStartAt") updatedStartAt: LocalDate?,
        @Param("updatedEndAt") updatedEndAt: LocalDate?,
        @Param("dn") dn: String?,
        @Param("createdByUuid") createdByUuid: String?,
        @Param("dealershipDn") dealershipDn: List<String>,
        @Param("dealershipDnEmpty") dealershipDnEmpty: Boolean,
        @Param("hasCampaigns") hasCampaigns: Boolean?,
        @Param("finished") finished: Boolean?,
        @Param("step") step: String?
    ) : OccurrenceStats

    @Query("SELECT "
            + "oc.uuid as occurrence_uuid, "
            + "COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(os.dt_end, CURRENT_TIMESTAMP) - os.dt_start)) / 60), 0) as total_minutes, "
            + "oc.customer as customer, "
            + "ov.model as model, "
            + "ov.chassis as chassis, "
            + "ov.emission_standard as legislation, "
            + "d.city as city, "
            + "d.state as state, "
            + "d.fantasy_name as fantasy_name, "
            + "os.id_step as step, "
            + "os.dt_start as step_start, "
            + "os.dt_end as step_end, "
            + "od.dn as dn "
            + "FROM occurrence oc "
            + "INNER JOIN occurrence_vehicle ov on oc.id = ov.id_occurrence "
            + "INNER JOIN occurrence_dealership od on oc.id = od.id_occurrence "
            + "INNER JOIN occurrence_step os on oc.id = os.id_occurrence "
            + "LEFT JOIN service_bay_schedule sbs on (oc.id = sbs.id_occurrence and sbs.active = true) "
            + "LEFT JOIN service_bay sb on sbs.service_bay_id = sb.id "
            + "LEFT JOIN dealership d on od.dn = d.dn "
            + "WHERE (:finished is null or (:finished = true and oc.end_date is not null) or (:finished = false and oc.end_date is null)) "
            + "AND (:accountUuid is null or oc.account_uuid = :accountUuid) "
            + "AND (cast(:createdStartAt as date) is null or date(oc.created_at) BETWEEN cast(:createdStartAt as date) AND cast(:createdEndAt as date)) "
            + "AND (cast(:updatedStartAt as date) is null or date(oc.updated_at) BETWEEN cast(:updatedStartAt as date) AND cast(:updatedEndAt as date)) "
            + "AND (:criticality is null or oc.criticality = :criticality) "
            + "AND (:partnerId is null or oc.partner_id = :partnerId) "
            + "AND (:chassisEmpty = true or ov.chassis IN (:chassis)) "
            + "AND (:dn is null or od.dn = :dn) "
            + "AND (:occurrenceType is null or :occurrenceType = '' or oc.occurence_type = ANY(string_to_array(:occurrenceType, ','))) "
            + "AND (:createdByUuid is null or oc.created_by_uuid = :createdByUuid) "
            + "AND (:dealershipDnEmpty = true or od.dn IN (:dealershipDn)) "
            + "AND (:hasCampaigns is null or oc.has_campaigns = :hasCampaigns) "
            + "AND (:step is null or (os.id_step = :step AND os.dt_end IS NULL)) "
            + "GROUP BY oc.uuid, oc.customer, ov.model, ov.emission_standard, d.city, d.state, ov.chassis, d.fantasy_name, od.dn, os.id_step, os.dt_start, os.dt_end "
            + "ORDER BY oc.uuid", nativeQuery = true)
    fun listOccurrencesWithMinutes(
        @Param("accountUuid") accountUuid: String?,
        @Param("chassis") chassis: List<String>,
        @Param("chassisEmpty") chassisEmpty: Boolean,
        @Param("occurrenceType") occurrenceType: String?,
        @Param("criticality") criticality: Int?,
        @Param("partnerId") partnerId: String?,
        @Param("createdStartAt") createdStartAt: LocalDate?,
        @Param("createdEndAt") createdEndAt: LocalDate?,
        @Param("updatedStartAt") updatedStartAt: LocalDate?,
        @Param("updatedEndAt") updatedEndAt: LocalDate?,
        @Param("dn") dn: String?,
        @Param("createdByUuid") createdByUuid: String?,
        @Param("dealershipDn") dealershipDn: List<String>,
        @Param("dealershipDnEmpty") dealershipDnEmpty: Boolean,
        @Param("hasCampaigns") hasCampaigns: Boolean?,
        @Param("finished") finished: Boolean?,
        @Param("step") step: String?
    ) : List<OccurrenceWithMinutes>
}