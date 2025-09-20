package br.com.vw.uptime.schedule.infrastructure.repositories.occurrence

import br.com.vw.uptime.schedule.infrastructure.entities.occurence.OccurrenceEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate

interface OccurrenceAnalyticsRepository : JpaRepository<OccurrenceEntity, Int> {

    @Query(
        """
            select
                ocveh.emission_standard,
                count(distinct oc.uuid),
                array_agg(distinct oc.uuid) as occurrence_ids,
                array_agg(distinct ocveh.chassis) as chassis_list
            from
                occurrence oc 
                inner join occurrence_vehicle ocveh on ocveh.id_occurrence = oc.id
                inner join occurrence_dealership ocdea on ocdea.id_occurrence = oc.id
                inner join dealership dea on dea.dn = ocdea.dn
                inner join occurrence_step ocste on ocste.id_occurrence = oc.id
            where
                oc.end_date is null
                and (:model is null or ocveh.model = :model)
                and (:customer is null or oc.customer = :customer)
                and (:state is null or dea.state = :state)
                and (:dn is null or dea.dn = :dn)
                and (:accountId is null or oc.account_uuid = :accountId)
                and (:city is null or dea.city = :city)
                and (:stepType is null or ocste.id_step = :stepType)
                and (created_at between date(:startDate) and date(:endDate))
            group by
                ocveh.emission_standard
        """,
        nativeQuery = true
    )
    fun calculateOccurrenceByLegislation(
        @Param("model") model:String?,
        @Param("customer") customer:String?,
        @Param("state") state:String?,
        @Param("city") city:String?,
        @Param("stepType") stepType:String?,
        @Param("startDate") startDate:LocalDate,
        @Param("endDate") endDate:LocalDate,
        @Param("accountId") accountId:String?,
        @Param("dn") dn:String?,
    ) : List<Map<String, Any>>

    @Query(
        """
            select
                ocveh.emission_standard,
                ROUND(EXTRACT(EPOCH FROM avg(DISTINCT (CURRENT_TIMESTAMP - oc.created_at))) / 60) AS avg_minutes,
                array_agg(distinct oc.uuid) as occurrence_ids,
                array_agg(distinct ocveh.chassis) as chassis_list
            from
                occurrence oc 
                inner join occurrence_vehicle ocveh on ocveh.id_occurrence = oc.id
                inner join occurrence_dealership ocdea on ocdea.id_occurrence = oc.id
                inner join dealership dea on dea.dn = ocdea.dn
                inner join occurrence_step ocste on ocste.id_occurrence = oc.id
            where
                oc.end_date is null
                and (:model is null or ocveh.model = :model)
                and (:customer is null or oc.customer = :customer)
                and (:state is null or dea.state = :state)
                and (:dn is null or dea.dn = :dn)
                and (:accountId is null or oc.account_uuid = :accountId)
                and (:city is null or dea.city = :city)
                and (:stepType is null or ocste.id_step = :stepType)
                and (created_at between date(:startDate) and date(:endDate))
            group by
                ocveh.emission_standard
        """,
        nativeQuery = true
    )
    fun calculateOccurrenceByLegislationAverage(
        @Param("model") model:String?,
        @Param("customer") customer:String?,
        @Param("state") state:String?,
        @Param("city") city:String?,
        @Param("stepType") stepType:String?,
        @Param("startDate") startDate:LocalDate,
        @Param("endDate") endDate:LocalDate,
        @Param("accountId") accountId:String?,
        @Param("dn") dn:String?,
    ) : List<Map<String, Any>>


    @Query(
        """
            select
                sanitize(ocveh.model) as model,
                ROUND(EXTRACT(EPOCH FROM avg(DISTINCT (CURRENT_TIMESTAMP - oc.created_at))) / 60) AS avg_minutes,
                array_agg(distinct oc.uuid) as occurrence_ids,
                array_agg(distinct ocveh.chassis) as chassis_list
            from
                occurrence oc 
                inner join occurrence_vehicle ocveh on ocveh.id_occurrence = oc.id
                inner join occurrence_dealership ocdea on ocdea.id_occurrence = oc.id
                inner join dealership dea on dea.dn = ocdea.dn
                inner join occurrence_step ocste on ocste.id_occurrence = oc.id
            where
                oc.end_date is null
                and (:emissionStandard is null or ocveh.emission_standard = :emissionStandard)
                and (:customer is null or oc.customer = :customer)
                and (:state is null or dea.state = :state)
                and (:dn is null or dea.dn = :dn)
                and (:accountId is null or oc.account_uuid = :accountId)
                and (:city is null or dea.city = :city)
                and (:stepType is null or ocste.id_step = :stepType)
                and (created_at between date(:startDate) and date(:endDate))
            group by
                sanitize(ocveh.model)
        """,
        nativeQuery = true
    )
    fun calculateOccurrenceByModelAmount(
        @Param("emissionStandard") emissionStandard:String?,
        @Param("customer") customer:String?,
        @Param("state") state:String?,
        @Param("city") city:String?,
        @Param("stepType") stepType:String?,
        @Param("startDate") startDate:LocalDate,
        @Param("endDate") endDate:LocalDate,
        @Param("accountId") accountId:String?,
        @Param("dn") dn:String?,
    ) : List<Map<String, Any>>

    @Query(
        """
            select
                sanitize(ocveh.model) as model,
                count(distinct oc.uuid),
                array_agg(distinct oc.uuid) as occurrence_ids,
                array_agg(distinct ocveh.chassis) as chassis_list
            from
                occurrence oc
                inner join occurrence_vehicle ocveh on ocveh.id_occurrence = oc.id
                inner join occurrence_dealership ocdea on ocdea.id_occurrence = oc.id
                inner join dealership dea on dea.dn = ocdea.dn
                inner join occurrence_step ocste on ocste.id_occurrence = oc.id
            where
                oc.end_date is null
                and ocste.latest = 1
                and (:emissionStandard is null or ocveh.emission_standard = :emissionStandard)
                and (:customer is null or oc.customer = :customer)
                and (:state is null or dea.state = :state)
                and (:dn is null or dea.dn = :dn)
                and (:accountId is null or oc.account_uuid = :accountId)
                and (:city is null or dea.city = :city)
                and (:stepType is null or ocste.id_step = :stepType)
                and (created_at between date(:startDate) and date(:endDate))
            group by
                sanitize(ocveh.model)
        """,
        nativeQuery = true
    )
    fun calculateOccurrenceByModelAverage(
        @Param("emissionStandard") emissionStandard:String?,
        @Param("customer") customer:String?,
        @Param("state") state:String?,
        @Param("city") city:String?,
        @Param("stepType") stepType:String?,
        @Param("startDate") startDate:LocalDate,
        @Param("endDate") endDate:LocalDate,
        @Param("accountId") accountId:String?,
        @Param("dn") dn:String?,
    ) : List<Map<String, Any>>


    @Query(
        """
            select
                dea.state,
                count(distinct oc.uuid),
                array_agg(distinct oc.uuid) as occurrence_ids,
                array_agg(distinct ocveh.chassis) as chassis_list
            from
                occurrence oc
                inner join occurrence_vehicle ocveh on ocveh.id_occurrence = oc.id
                inner join occurrence_dealership ocdea on ocdea.id_occurrence = oc.id
                inner join dealership dea on dea.dn = ocdea.dn
                inner join occurrence_step ocste on ocste.id_occurrence = oc.id
            where
                oc.end_date is null
                and (:emissionStandard is null or ocveh.emission_standard = :emissionStandard)
                and (:customer is null or oc.customer = :customer)
                and (:model is null or ocveh.model = :model)
                and (:dn is null or dea.dn = :dn)
                and (:accountId is null or oc.account_uuid = :accountId)
                and (:city is null or dea.city = :city)
                and (:stepType is null or ocste.id_step = :stepType)
                and (created_at between date(:startDate) and date(:endDate))
            group by
                dea.state
        """,
        nativeQuery = true
    )
    fun calculateOccurrenceByStateAmount(
        @Param("emissionStandard") emissionStandard:String?,
        @Param("customer") customer:String?,
        @Param("model") model:String?,
        @Param("city") city:String?,
        @Param("stepType") stepType:String?,
        @Param("startDate") startDate:LocalDate,
        @Param("endDate") endDate:LocalDate,
        @Param("accountId") accountId:String?,
        @Param("dn") dn:String?,
    ) : List<Map<String, Any>>


    @Query(
        """
            select
                dea.state,
                ROUND(EXTRACT(EPOCH FROM avg(DISTINCT (CURRENT_TIMESTAMP - oc.created_at))) / 60) AS avg_minutes,
                array_agg(distinct oc.uuid) as occurrence_ids,
                array_agg(distinct ocveh.chassis) as chassis_list
            from
                occurrence oc
                inner join occurrence_vehicle ocveh on ocveh.id_occurrence = oc.id
                inner join occurrence_dealership ocdea on ocdea.id_occurrence = oc.id
                inner join dealership dea on dea.dn = ocdea.dn
                inner join occurrence_step ocste on ocste.id_occurrence = oc.id
            where
                oc.end_date is null
                and (:emissionStandard is null or ocveh.emission_standard = :emissionStandard)
                and (:customer is null or oc.customer = :customer)
                and (:model is null or ocveh.model = :model)
                and (:dn is null or dea.dn = :dn)
                and (:accountId is null or oc.account_uuid = :accountId)
                and (:city is null or dea.city = :city)
                and (:stepType is null or ocste.id_step = :stepType)
                and (created_at between date(:startDate) and date(:endDate))
            group by
                dea.state
        """,
        nativeQuery = true
    )
    fun calculateOccurrenceByStateAverage(
        @Param("emissionStandard") emissionStandard:String?,
        @Param("customer") customer:String?,
        @Param("model") model:String?,
        @Param("city") city:String?,
        @Param("stepType") stepType:String?,
        @Param("startDate") startDate:LocalDate,
        @Param("endDate") endDate:LocalDate,
        @Param("accountId") accountId:String?,
        @Param("dn") dn:String?,
    ) : List<Map<String, Any>>

    @Query(
        """
            select
                dea.city,
                count(distinct oc.uuid),
                array_agg(distinct oc.uuid) as occurrence_ids,
                array_agg(distinct ocveh.chassis) as chassis_list
            from
                occurrence oc
                inner join occurrence_vehicle ocveh on ocveh.id_occurrence = oc.id
                inner join occurrence_dealership ocdea on ocdea.id_occurrence = oc.id
                inner join dealership dea on dea.dn = ocdea.dn
                inner join occurrence_step ocste on ocste.id_occurrence = oc.id
            where
                oc.end_date is null
                and (:emissionStandard is null or ocveh.emission_standard = :emissionStandard)
                and (:customer is null or oc.customer = :customer)
                and (:model is null or ocveh.model = :model)
                and (:dn is null or dea.dn = :dn)
                and (:accountId is null or oc.account_uuid = :accountId)
                and (:state is null or dea.state = :state)
                and (:stepType is null or ocste.id_step = :stepType)
                and (created_at between date(:startDate) and date(:endDate))
            group by
                dea.city
        """,
        nativeQuery = true
    )
    fun calculateOccurrenceByCityAmount(
        @Param("emissionStandard") emissionStandard:String?,
        @Param("customer") customer:String?,
        @Param("model") model:String?,
        @Param("state") state:String?,
        @Param("stepType") stepType:String?,
        @Param("startDate") startDate:LocalDate,
        @Param("endDate") endDate:LocalDate,
        @Param("accountId") accountId:String?,
        @Param("dn") dn:String?,
    ) : List<Map<String, Any>>

    @Query(
        """
            select
                dea.city,
                 ROUND(EXTRACT(EPOCH FROM avg(DISTINCT (CURRENT_TIMESTAMP - oc.created_at))) / 60) AS avg_minutes,
                 array_agg(distinct oc.uuid) as occurrence_ids,
                 array_agg(distinct ocveh.chassis) as chassis_list
            from
                occurrence oc
                inner join occurrence_vehicle ocveh on ocveh.id_occurrence = oc.id
                inner join occurrence_dealership ocdea on ocdea.id_occurrence = oc.id
                inner join dealership dea on dea.dn = ocdea.dn
                inner join occurrence_step ocste on ocste.id_occurrence = oc.id
            where
                oc.end_date is null
                and (:emissionStandard is null or ocveh.emission_standard = :emissionStandard)
                and (:customer is null or oc.customer = :customer)
                and (:model is null or ocveh.model = :model)
                and (:dn is null or dea.dn = :dn)
                and (:accountId is null or oc.account_uuid = :accountId)
                and (:state is null or dea.state = :state)
                and (:stepType is null or ocste.id_step = :stepType)
                and (created_at between date(:startDate) and date(:endDate))
            group by
                dea.city
        """,
        nativeQuery = true
    )
    fun calculateOccurrenceByCityAverage(
        @Param("emissionStandard") emissionStandard:String?,
        @Param("customer") customer:String?,
        @Param("model") model:String?,
        @Param("state") state:String?,
        @Param("stepType") stepType:String?,
        @Param("startDate") startDate:LocalDate,
        @Param("endDate") endDate:LocalDate,
        @Param("accountId") accountId:String?,
        @Param("dn") dn:String?,
    ) : List<Map<String, Any>>

    @Query(
        """
            select
                ocste.id_step,
                count(distinct oc.uuid),
                array_agg(distinct oc.uuid) as occurrence_ids,
                array_agg(distinct ocveh.chassis) as chassis_list
            from
                occurrence oc
                inner join occurrence_vehicle ocveh on ocveh.id_occurrence = oc.id
                inner join occurrence_dealership ocdea on ocdea.id_occurrence = oc.id
                inner join dealership dea on dea.dn = ocdea.dn
                inner join occurrence_step ocste on ocste.id_occurrence = oc.id
            where
                oc.end_date is null
                and (:emissionStandard is null or ocveh.emission_standard = :emissionStandard)
                and (:customer is null or oc.customer = :customer)
                and (:model is null or ocveh.model = :model)
                and (:dn is null or dea.dn = :dn)
                and (:accountId is null or oc.account_uuid = :accountId)
                and (:state is null or dea.state = :state)
                and (:city is null or dea.city = :city)
                and (created_at between date(:startDate) and date(:endDate))
            group by
                ocste.id_step
        """,
        nativeQuery = true
    )
    fun calculateOccurrenceByStepAmount(
        @Param("emissionStandard") emissionStandard:String?,
        @Param("customer") customer:String?,
        @Param("model") model:String?,
        @Param("state") state:String?,
        @Param("city") city:String?,
        @Param("startDate") startDate:LocalDate,
        @Param("endDate") endDate:LocalDate,
        @Param("accountId") accountId:String?,
        @Param("dn") dn:String?,
    ) : List<Map<String, Any>>

    @Query(
        """
            select
                ocste.id_step,
                ROUND(EXTRACT(EPOCH FROM avg(DISTINCT (CURRENT_TIMESTAMP - ocste.dt_start))) / 60) AS avg_minutes,
                array_agg(distinct oc.uuid) as occurrence_ids,
                array_agg(distinct ocveh.chassis) as chassis_list
            from
                occurrence oc
                inner join occurrence_vehicle ocveh on ocveh.id_occurrence = oc.id
                inner join occurrence_dealership ocdea on ocdea.id_occurrence = oc.id
                inner join dealership dea on dea.dn = ocdea.dn
                inner join occurrence_step ocste on ocste.id_occurrence = oc.id
            where
                oc.end_date is null
                and (:emissionStandard is null or ocveh.emission_standard = :emissionStandard)
                and (:customer is null or oc.customer = :customer)
                and (:model is null or ocveh.model = :model)
                and (:dn is null or dea.dn = :dn)
                and (:accountId is null or oc.account_uuid = :accountId)
                and (:state is null or dea.state = :state)
                and (:city is null or dea.city = :city)
                and (created_at between date(:startDate) and date(:endDate))
            group by
                ocste.id_step
        """,
        nativeQuery = true
    )
    fun calculateOccurrenceByStepAverage(
        @Param("emissionStandard") emissionStandard:String?,
        @Param("customer") customer:String?,
        @Param("model") model:String?,
        @Param("state") state:String?,
        @Param("city") city:String?,
        @Param("startDate") startDate:LocalDate,
        @Param("endDate") endDate:LocalDate,
        @Param("accountId") accountId:String?,
        @Param("dn") dn:String?,
    ) : List<Map<String, Any>>

    @Query(
        """
            select
                COALESCE(oc.customer, 'N/A') as customer,
                count(distinct oc.uuid),
                array_agg(distinct oc.uuid) as occurrence_ids,
                array_agg(distinct ocveh.chassis) as chassis_list
            from
                occurrence oc 
                inner join occurrence_vehicle ocveh on ocveh.id_occurrence = oc.id
                inner join occurrence_dealership ocdea on ocdea.id_occurrence = oc.id
                inner join dealership dea on dea.dn = ocdea.dn
                inner join occurrence_step ocste on ocste.id_occurrence = oc.id
            where
                oc.end_date is null
                and (cast(:chassis as text) is null or ocveh.chassis = :chassis)
                and (cast(:criticality as int) is null or oc.criticality = :criticality)
                and (cast(:createdStartAt as date) is null or date(oc.created_at) >= date(:createdStartAt))
                and (cast(:createdEndAt as date) is null or date(oc.created_at) <= date(:createdEndAt))
                and (cast(:updatedStartAt as date) is null or date(oc.updated_at) >= date(:updatedStartAt))
                and (cast(:updatedEndAt as date) is null or date(oc.updated_at) <= date(:updatedEndAt))
                and (cast(:dn as text) is null or dea.dn = :dn)
                and (cast(:stepType as text) is null or ocste.id_step = :stepType)
                and (cast(:vehicle as text) is null or ocveh.model = :vehicle)
                and (cast(:emissionStandard as text) is null or ocveh.emission_standard = :emissionStandard)
                and (cast(:state as text) is null or dea.state = :state)
                and (cast(:city as text) is null or dea.city = :city)
                and (cast(:accountId as text) is null or oc.account_uuid = :accountId)
            group by
                COALESCE(oc.customer, 'N/A')
        """,
        nativeQuery = true
    )
    fun calculateOccurrenceByCustomerAmount(
        @Param("chassis") chassis: String?,
        @Param("criticality") criticality: Int?,
        @Param("createdStartAt") createdStartAt: LocalDate?,
        @Param("createdEndAt") createdEndAt: LocalDate?,
        @Param("updatedStartAt") updatedStartAt: LocalDate?,
        @Param("updatedEndAt") updatedEndAt: LocalDate?,
        @Param("dn") dn: String?,
        @Param("stepType") stepType: String?,
        @Param("vehicle") vehicle: String?,
        @Param("emissionStandard") emissionStandard: String?,
        @Param("state") state: String?,
        @Param("city") city: String?,
        @Param("accountId") accountId: String?
    ) : List<Map<String, Any>>

    @Query(
        """
            select
                COALESCE(oc.customer, 'N/A') as customer,
                ROUND(EXTRACT(EPOCH FROM avg(DISTINCT (CURRENT_TIMESTAMP - oc.created_at))) / 60) AS avg_minutes,
                array_agg(distinct oc.uuid) as occurrence_ids,
                array_agg(distinct ocveh.chassis) as chassis_list
            from
                occurrence oc 
                inner join occurrence_vehicle ocveh on ocveh.id_occurrence = oc.id
                inner join occurrence_dealership ocdea on ocdea.id_occurrence = oc.id
                inner join dealership dea on dea.dn = ocdea.dn
                inner join occurrence_step ocste on ocste.id_occurrence = oc.id
            where
                oc.end_date is null
                and (cast(:chassis as text) is null or ocveh.chassis = :chassis)
                and (cast(:criticality as int) is null or oc.criticality = :criticality)
                and (cast(:createdStartAt as date) is null or date(oc.created_at) >= date(:createdStartAt))
                and (cast(:createdEndAt as date) is null or date(oc.created_at) <= date(:createdEndAt))
                and (cast(:updatedStartAt as date) is null or date(oc.updated_at) >= date(:updatedStartAt))
                and (cast(:updatedEndAt as date) is null or date(oc.updated_at) <= date(:updatedEndAt))
                and (cast(:dn as text) is null or dea.dn = :dn)
                and (cast(:stepType as text) is null or ocste.id_step = :stepType)
                and (cast(:vehicle as text) is null or ocveh.model = :vehicle)
                and (cast(:emissionStandard as text) is null or ocveh.emission_standard = :emissionStandard)
                and (cast(:state as text) is null or dea.state = :state)
                and (cast(:city as text) is null or dea.city = :city)
                and (cast(:accountId as text) is null or oc.account_uuid = :accountId)
            group by
                COALESCE(oc.customer, 'N/A')
        """,
        nativeQuery = true
    )
    fun calculateOccurrenceByCustomerAverage(
        @Param("chassis") chassis: String?,
        @Param("criticality") criticality: Int?,
        @Param("createdStartAt") createdStartAt: LocalDate?,
        @Param("createdEndAt") createdEndAt: LocalDate?,
        @Param("updatedStartAt") updatedStartAt: LocalDate?,
        @Param("updatedEndAt") updatedEndAt: LocalDate?,
        @Param("dn") dn: String?,
        @Param("stepType") stepType: String?,
        @Param("vehicle") vehicle: String?,
        @Param("emissionStandard") emissionStandard: String?,
        @Param("state") state: String?,
        @Param("city") city: String?,
        @Param("accountId") accountId: String?
    ) : List<Map<String, Any>>

    @Query(
        """
            select
                count(DISTINCT oc.id) as total_finished_count,
                ROUND(EXTRACT(EPOCH FROM avg(oc.end_date - oc.created_at)) / 60) AS total_finished_avg_minutes,
                array_agg(distinct oc.uuid) as occurrence_ids,
                array_agg(distinct ocveh.chassis) as chassis_list
            from
                occurrence oc
                inner join occurrence_vehicle ocveh on ocveh.id_occurrence = oc.id
                inner join occurrence_dealership ocdea on ocdea.id_occurrence = oc.id
                inner join dealership dea on dea.dn = ocdea.dn
                inner join occurrence_step ocste on ocste.id_occurrence = oc.id
            where
                oc.end_date is not null
                and (:emissionStandard is null or ocveh.emission_standard = :emissionStandard)
                and (:customer is null or oc.customer = :customer)
                and (:model is null or ocveh.model = :model)
                and (:dn is null or dea.dn = :dn)
                and (:accountId is null or oc.account_uuid = :accountId)
                and (:state is null or dea.state = :state)
                and (:city is null or dea.city = :city)
                and (created_at between date(:startDate) and date(:endDate))
        """,
        nativeQuery = true
    )
    fun calculateTotalFinishedOccurrence(
        @Param("emissionStandard") emissionStandard:String?,
        @Param("customer") customer:String?,
        @Param("model") model:String?,
        @Param("state") state:String?,
        @Param("city") city:String?,
        @Param("startDate") startDate:LocalDate,
        @Param("endDate") endDate:LocalDate,
        @Param("accountId") accountId:String?,
        @Param("dn") dn:String?,
    ) : Map<String, Any>

    @Query(
        """
            select
                count(DISTINCT oc.id) as total_in_progress_count,
                ROUND(EXTRACT(EPOCH FROM avg(CURRENT_TIMESTAMP - oc.created_at)) / 60) AS total_in_progress_avg_minutes,
                array_agg(distinct oc.uuid) as occurrence_ids,
                array_agg(distinct ocveh.chassis) as chassis_list
            from
                occurrence oc
                inner join occurrence_vehicle ocveh on ocveh.id_occurrence = oc.id
                inner join occurrence_dealership ocdea on ocdea.id_occurrence = oc.id
                inner join dealership dea on dea.dn = ocdea.dn
                inner join occurrence_step ocste on ocste.id_occurrence = oc.id
            where
                oc.end_date is null
                and (:emissionStandard is null or ocveh.emission_standard = :emissionStandard)
                and (:customer is null or oc.customer = :customer)
                and (:model is null or ocveh.model = :model)
                and (:dn is null or dea.dn = :dn)
                and (:accountId is null or oc.account_uuid = :accountId)
                and (:stepType is null or ocste.id_step = :stepType)
                and (:state is null or dea.state = :state)
                and (:city is null or dea.city = :city)
                and (created_at between date(:startDate) and date(:endDate))
        """,
        nativeQuery = true
    )
    fun calculateTotalInProgressOccurrence(
        @Param("emissionStandard") emissionStandard:String?,
        @Param("customer") customer:String?,
        @Param("model") model:String?,
        @Param("state") state:String?,
        @Param("city") city:String?,
        @Param("stepType") stepType:String?,
        @Param("startDate") startDate:LocalDate,
        @Param("endDate") endDate:LocalDate,
        @Param("accountId") accountId:String?,
        @Param("dn") dn:String?,
    ) : Map<String, Any>

}
