package br.com.vw.uptime.schedule.core.enums.checkups

import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse

enum class ErrorCode(val code: String, val message: String) {

    NO_GROUP_OR_VEHICLE_FOUND("7", "Não foi possível encontrar a revisão pelo modelo e grupo fornecido"),
    NO_CHECKUP_FOUND("8", "Revisão não encontrada"),
    NO_CONSULTANT_AVAILABLE("9", "Consultor não disponível para agendamento"),
    NO_CONSULTANT_FOUND("10", "Consultor não encontrado pelo ID fornecido"),
    NO_DEALERSHIP_AVAILABLE("11", "Concessionaria não encontrada"),
    NO_CHECKUP_SCHEDULE_AVAILABLE("12", "Agendamento de revisão/manutenção não encontrado"),
    INVALID_MAINTENANCE_STATUS("13", "Status de manutenção inválida"),
    CHECKUP_OR_FIELD_ACTION_SHOULD_BE_PRESENT("14", "Deve ter pelo menos um campo de ação ou uma revisão para a criação do agendamento"),
    FIELD_CAMPAIGN_FOUND("15", "Campo de campanha não encontrado para o chassi e numero do campo de campanha fornecido"),
    NO_CHECKUP_SCHEDULE_FOUND("16", "Agendamento não encontrado"),
    MAINTENANCE_TICKET_ALREADY_FOR_GIVEN_SCHEDULE("17", "Já existe um chamado de manutenção para o agendamento fornecido"),
    SOME_FIELD_CAMPAIGNS_NOT_EXISTS("18", "Algumas campanhas de campo não existem para este veículo"),
    SOME_FIELD_CAMPAIGNS_HAS_SCHEDULE("19", "Algumas campanhas de campo já possuem agendamento"),
    CHECKUP_ALREADY_SCHEDULED("20", "Para este veículo, Já existe um agendamento criado para a revisão fornecida"),
    TICKET_NOT_FOUND("21", "Chamado não encontrado"),
    TICKET_INVALID_STATE_TO_CHANGE("22", "Estado invalido para a mudança de status"),
    ASSET_NOT_FOUND("23", "Asset (veículo) não encontrado"),
    METRIC_NUMBER_EMPTY("24", "Odometro ou horimetro é nulo para o tipo de metrica exigido"),
    MISSING_FIELDS("25", "Faltando campos"),
    NO_ROLE_FOUND("26", "Não foi encontrado um role para esse usuário"),
    MODEL_NOT_FOUND_BY_CHASSIS("27", "Modelo não encontrado pelo chassi fornecido"),
    MODEL_NOT_MAPPED_TO_MANUAL("28", "Modelo não mapeado com algum manual"),
    METRIC_VALUE_NULL("29", "Odometro ou horimetro nulo, conforme o grupo de manutenção dado"),
    PRIORITY_MUST_BE_GREATER_ZERO("30", "Prioridade deve ser a partir de 1"),
    DISPATCH_ALREADY_EXISTS("31", "Um acionamento já foi atribuído para este socorro"),
    ASSISTANCE_IN_PROGRESS_ALREADY_EXISTS("32", "Já existe uma ocorrência em progresso para o veículo fornecido"),
    OCCURRENCE_NOT_FOUND("33", "Ocorrência / chamado não encontrado"),
    NO_DISPATCH_FOR_ASSISTANCE("34", "Acionamento não encontrado para este socorro mecânico"),
    OCCURRENCE_NOT_FINISHED("35", "Existe uma ocorrencia em aberto para o veículo selecionado"),
    START_DATE_MUST_BE_BEFORE_END_DATE("36", "Data final deve ser posterior à data de inicio"),
    OCCURRENCE_STEP_ALREADY_FINISHED("37", "Etapa já finalizada"),
    OCCURRENCE_STEP_SAME("38", "A etapa solicitada deve ser diferente da etapa atual. Selecione uma outra etapa."),
    CURRENT_OCCURRENCE_STEP_NOT_EXISTS("39", "Não existe etapa iniciada."),
    CURRENT_STEP_MUST_BE_LAST("40", "Só pode ser finalizado na última etapa da ocorrência."),
    SERVICE_BAY_NOT_FOUND("41", "Box não encontrado."),
    SERVICE_BAY_SCHEDULE_CONFLICT("42", "Existe algum agendamento em conflito com as datas preenchidas para o box selecionado"),
    SERVICE_BAY_NAME_ALREADY_EXISTS("43", "Já existe um box com este nome"),
    SERVICE_BAY_SCHEDULE_NOT_FOUND("44", "Agendamento de box não encontrado"),
    SERVICE_BAY_WITH_OCCURRENCE_EXISTS("45", "Já existe um box agendamento com a ocorrência fornecida"),
    STEP_NOT_FOUND("46", "Não foi encontrado a etapa pelo ID fornecido."),
    ENTITY_NOT_FOUND("ENTITY_NOT_FOUND", ""),
    NOT_AUTHORIZED("401", "Autenticação OAuth inválida"),
    EXPIRED_TOKEN("401", "Token expirado");

    fun toResponse() : ErrorCodeResponse {
        return ErrorCodeResponse(
            code,
            message
        )
    }
}