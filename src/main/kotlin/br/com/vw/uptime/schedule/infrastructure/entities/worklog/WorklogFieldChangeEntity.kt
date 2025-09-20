package br.com.vw.uptime.schedule.infrastructure.entities.worklog

import jakarta.persistence.*
import java.time.LocalDateTime

/**
 * Entidade para registrar logs de alteração de campos específicos
 * Registra: Campo alterado, Valor Antigo, Novo Valor
 */
@Entity
@Table(
    name = "WORKLOG_FIELD_CHANGE",
    indexes = [
        Index(name = "WORKLOG_FIELD_WORKLOG_IDX", columnList = "WORKLOG_KANBAN_ID"),
        Index(name = "WORKLOG_FIELD_FIELD_IDX", columnList = "FIELD_NAME")
    ]
)
data class WorklogFieldChangeEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WORKLOG_KANBAN_ID", nullable = false)
    var worklogKanban: WorklogKanbanEntity,

    @Column(name = "FIELD_NAME", nullable = false)
    var fieldName: String,

    @Column(name = "OLD_VALUE", columnDefinition = "TEXT")
    var oldValue: String? = null,

    @Column(name = "NEW_VALUE", columnDefinition = "TEXT")
    var newValue: String? = null,

    @Column(name = "FIELD_TYPE")
    var fieldType: String? = null, // "STRING", "NUMBER", "DATE", "BOOLEAN", "JSON"

    @Column(name = "CHANGED_AT", nullable = false)
    var changedAt: LocalDateTime = LocalDateTime.now()
)
