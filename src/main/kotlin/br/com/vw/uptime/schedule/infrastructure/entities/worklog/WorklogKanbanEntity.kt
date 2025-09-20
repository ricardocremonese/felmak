package br.com.vw.uptime.schedule.infrastructure.entities.worklog

import br.com.vw.uptime.schedule.infrastructure.services.occurence.StepTypeOccurrence
import jakarta.persistence.*
import java.time.LocalDateTime

/**
 * Entidade para registrar logs de alteração de etapas no Kanban
 * Registra: Usuário, Data Alteração, Etapa, Status Anterior, Novo Status
 */
@Entity
@Table(
    name = "WORKLOG_KANBAN",
    indexes = [
        Index(name = "WORKLOG_KANBAN_OCCURRENCE_IDX", columnList = "OCCURRENCE_ID"),
        Index(name = "WORKLOG_KANBAN_USER_IDX", columnList = "USER_ID"),
        Index(name = "WORKLOG_KANBAN_DATE_IDX", columnList = "CHANGED_AT")
    ]
)
data class WorklogKanbanEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    var id: Long? = null,

    @Column(name = "OCCURRENCE_ID", nullable = false)
    var occurrenceId: Int,

    @Column(name = "OCCURRENCE_UUID", nullable = false)
    var occurrenceUuid: String,

    @Enumerated(EnumType.STRING)
    @Column(name = "STEP", nullable = false)
    var step: StepTypeOccurrence,

    @Enumerated(EnumType.STRING)
    @Column(name = "PREVIOUS_STATUS")
    var previousStatus: StepTypeOccurrence? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "NEW_STATUS", nullable = false)
    var newStatus: StepTypeOccurrence,

    @Column(name = "USER_ID", nullable = false)
    var userId: String,

    @Column(name = "USER_UUID")
    var userUuid: String? = null,

    @Column(name = "USER_NAME")
    var userName: String? = null,

    @Column(name = "CHANGED_AT", nullable = false)
    var changedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "ACTION_TYPE", nullable = false)
    var actionType: String, // "STEP_CHANGE", "FIELD_UPDATE", "CARD_MOVED"

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    var description: String? = null
)
