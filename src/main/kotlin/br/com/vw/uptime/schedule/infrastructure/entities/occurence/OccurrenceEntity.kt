package br.com.vw.uptime.schedule.infrastructure.entities.occurence

import br.com.vw.uptime.schedule.core.enums.occurrence.FinalizationReasonType
import br.com.vw.uptime.schedule.infrastructure.services.occurence.StepTypeOccurrence
import jakarta.persistence.*

import java.time.LocalDateTime

@Entity
@Table(name = "OCCURRENCE", indexes = [Index(name = "OCCURRENCE_SCHEDULE_UUID_IDX", columnList = "SCHEDULE_UUID", unique = true),
    Index(name = "OCCURRENCE_UUID_IDX", columnList = "UUID", unique = true)] )
class OccurrenceEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    var id: Int? = null,

    @Column(name = "UUID", nullable = false)
    var uuid: String = "",

    @Column(name = "ACCOUNT_UUID")
    var accountUuid: String? = null,

    @Column(name = "CHASSIS")
    var chassis: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "CURRENT_STEP")
    var currentStep: StepTypeOccurrence = StepTypeOccurrence.TICKE,

    @Column(name = "END_DATE")
    var endDate: LocalDateTime? = null,

    @Column(name = "CRITICALITY")
    var criticality: Int? = null,

    @Column(name = "OS_NUMBER")
    var osNumber: String? = null,

    @Column(name = "OS_DT_OPEN_AT")
    var osDtOpenAt: LocalDateTime? = null,

    @Column(name = "RENTER")
    var renter: String? = "",

    @Column(name = "CREATED_BY")
    var createdBy: String = "",

    @Column(name = "CREATED_BY_UUID")
    var createdByUuid: String? = null,

    @Column(name = "CREATED_BY_USER_PROFILE_ID")
    var createdByUserProfileId: String? = null,

    @Column(name = "LITERATURE_TROUBLESHOOTING")
    var literatureTroubleshooting: String? = null,

    @Column(name = "COUNTRY")
    var country: String? = null,

    @Column(name = "OCCURENCE_TYPE")
    var occurrenceType: String? = null,

    @Column(name = "TAS_NUMBER")
    var tasNumber: String? = null,

    @Column(name = "TAS_STATUS")
    var tasStatus: String? = null,

    @Column(name = "TIME_OPEN_PROPTOCOLO")
    var timeOpenProtocol: Int? = null,

    @Column(name = "SOURCE")
    var source: String? = null,

    @Column(name = "OBSERVATION", columnDefinition = "TEXT")
    var observation: String? = null,

    @Column(name = "STATUS")
    var status: String? = null,

    @Column(name = "HAS_LINK")
    var hasLink: Boolean? = null,

    @Column(name = "MAIN_OCCURRENCE")
    var mainOccurrence: String? = null,

    @Column(name = "ESTIMATE_TIME_REPAIR")
    var estimateTimeRepair: Int? = null,

    @Column(name = "SOLUTION_PROPOSED", columnDefinition = "TEXT")
    var solutionProposed: String? = null,

    @Column(name = "MECHANIC_LOCATION")
    var mechanicLocation: String? = null,

    @Column(name = "TOW_TRUCK_LOCATION")
    var towTruckLocation: String? = null,

    @Column(name = "CHECKLIST")
    var checklist: String? = null,

    @Column(name = "CUSTOMER")
    var customer: String? = null,

    @Column(name = "UPDATED_AT")
    var updatedAt: LocalDateTime? = null,

    @Column(name = "CREATED_AT")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "PROTOCOL_NUMBER")
    var protocolNumber: String = "",

    @Column(name = "SCHEDULE_UUID")
    var scheduleUuid: String? = null,

    @Column(name = "PARTNER_ID")
    var partnerId: String? = null,

    @JoinColumn(name = "ID_OCCURRENCE")
    @OneToOne(mappedBy = "occurrence", cascade = [CascadeType.ALL], fetch = FetchType.LAZY, optional = false)
    var driver: OccurrenceDriverEntity? = null,

    @JoinColumn(name = "ID_OCCURRENCE")
    @OneToOne(mappedBy = "occurrence", cascade = [CascadeType.ALL], fetch = FetchType.LAZY, optional = false)
    var vehicle: OccurrenceVehicleEntity? = null,

    @OneToMany(mappedBy = "occurrence", cascade = [CascadeType.ALL], fetch = FetchType.LAZY,  orphanRemoval = true)
    var dtcs: MutableList<OccurrenceModuleEntity> = mutableListOf(),

    @OneToMany(mappedBy = "occurrence", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var occurrenceSteps:MutableList<OccurrenceStepEntity> = mutableListOf(),

    @OneToOne(mappedBy = "occurrence", cascade = [CascadeType.ALL],fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "ID_OCCURRENCE")
    var dealership: OccurrenceDealershipEntity? = null,

    @OneToOne(mappedBy = "occurrence", cascade = [CascadeType.ALL],fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "ID_OCCURRENCE")
    var partOrder: OccurrencePartOrderEntity? = null,

    @OneToMany(mappedBy = "occurrence", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var reviews: List<OccurrenceReviewEntity> = mutableListOf(),

    @OneToMany(mappedBy = "occurrence", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var dispatches: MutableList<DispatchEntity> = mutableListOf(),

    @OneToMany(mappedBy = "occurrence", cascade = [CascadeType.ALL], orphanRemoval = true)
    var serviceBaySchedule: List<ServiceBayScheduleEntity> = emptyList(),

    @Column(name = "FAILURES", columnDefinition = "TEXT")
    var failures: String? = null,

    @Column(name = "PART_ORDERS", columnDefinition = "TEXT")
    var partOrders: String? = null,

    @Column(name = "PART_ORDER_DELIVERY_DATES", columnDefinition = "TEXT")
    var partOrderDeliveryDates: String? = null,

    @Column(name = "HAS_CAMPAIGNS")
    var hasCampaigns: Boolean? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "FINALIZATION_REASON_TYPE")
    var finalizationReasonType: FinalizationReasonType? = null,

    @Column(name = "FINALIZATION_REASON_DESCRIPTION", columnDefinition = "TEXT")
    var finalizationReasonDescription: String? = null
)