package br.com.vw.uptime.schedule.infrastructure.services.occurence

import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.enums.maintenance.StepType
import br.com.vw.uptime.schedule.core.filters.UserAuthenticate
import br.com.vw.uptime.schedule.core.utils.TimeUtils
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.requests.occurrence.FinalizeOccurrenceRequest
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.OccurrenceStepEntity
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.OccurrenceEntity
import br.com.vw.uptime.schedule.infrastructure.entities.checkup.MaintenanceEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.OccurrenceRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.checkup.CheckupScheduleRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.OccurrenceStepRepository
import br.com.vw.uptime.schedule.infrastructure.repositories.users.User
import br.com.vw.uptime.schedule.infrastructure.services.user.UsersServiceImpl
import jakarta.validation.constraints.NotNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class OccurrenceStepService(
    private val occurrenceRepository: OccurrenceRepository,
    private val checkupScheduleRepository: CheckupScheduleRepository,
    private val occurrenceStepRepository: OccurrenceStepRepository,
    private val usersServiceImpl: UsersServiceImpl
) {

    @Transactional(readOnly = false)
    fun updateStep(occurrenceUuid:String, occurrenceStepUpdateRequest:OccurrenceStepChangeRequest): UpdateStepChangeResponse {
        val stepRequest = occurrenceStepUpdateRequest.targetStepType!!
        val occurrenceEntity = occurrenceRepository.getOccurrenceByUuid(occurrenceUuid) ?:
            throw BusinessException(ErrorCode.OCCURRENCE_NOT_FOUND.toResponse())
        val occurrenceStepEntityList = occurrenceEntity.occurrenceSteps
        val currentStep = checkSameStep(occurrenceStepEntityList, occurrenceStepUpdateRequest)
        val isLastStep = currentStep?.stepId?.next == null

        // If source step is the last step, must leave to a previous step, so, must remove end date to occurrence
        if(isLastStep) {
            occurrenceEntity.endDate = null
        }
        // The currentStep is previous now
        currentStep?.latest = 0
        currentStep?.dtEnd = currentStep?.dtEnd ?: LocalDateTime.now()

        occurrenceEntity.currentStep = stepRequest


        // Get all steps by step target name
        val allStepsFromOneTargetName = occurrenceStepEntityList.filter {
            it.stepId.name == stepRequest.name
        }

        // Get last target step by target step name
        val lastTargetStep = allStepsFromOneTargetName.maxByOrNull {
            it.dtStart
        }

        // Make new step using target step type and copying last step according to target step name
        val newTargetStep = OccurrenceStepEntity(
            stepId = stepRequest,
            estimatedTime = lastTargetStep?.estimatedTime,
            report = lastTargetStep?.report,
            observation = lastTargetStep?.observation,
            occurrence = occurrenceEntity,
            dtStart = LocalDateTime.now(),
            expectedDtEnd = lastTargetStep?.expectedDtEnd,
            latest = 1
        )
        occurrenceEntity.occurrenceSteps.add(newTargetStep)
        occurrenceRepository.save(occurrenceEntity)
        return UpdateStepChangeResponse().apply {
            this.estimatedTime = newTargetStep.estimatedTime?.let {
                TimeUtils.minutesToDurationString(it)
            }
            this.report = newTargetStep.report
            this.observation = newTargetStep.observation
            this.dtStart = newTargetStep.dtStart
            this.expectedDtEnd = newTargetStep.expectedDtEnd
        }
    }

    @Transactional(readOnly = false)
    fun finalizeOccurrence(occurrenceUuid:String, finalizeRequest: FinalizeOccurrenceRequest? = null): FinalizeOccurrenceResponse {
        val occurrenceEntity = occurrenceRepository.getOccurrenceByUuid(occurrenceUuid)
            ?: throw BusinessException(ErrorCode.OCCURRENCE_NOT_FOUND.toResponse())
        val currentStep = getCurrentStep(occurrenceEntity.occurrenceSteps)
            ?: throw BusinessException(
                ErrorCode.CURRENT_OCCURRENCE_STEP_NOT_EXISTS.toResponse()
            )
        val endDate = LocalDateTime.now()
        currentStep.dtEnd = endDate
        occurrenceEntity.endDate = endDate
        
        // Salvar os campos de motivo se fornecidos
        finalizeRequest?.let { request ->
            occurrenceEntity.finalizationReasonType = request.finalizationReasonType
            occurrenceEntity.finalizationReasonDescription = request.finalizationReasonDescription
        }
        
        occurrenceRepository.save(occurrenceEntity)
        
        // Verificar se a ocorrência tem relação com um agendamento UPT e finalizar o mesmo
        finalizeRelatedUptSchedule(occurrenceEntity)
        
        return FinalizeOccurrenceResponse().apply {
            this.endDate = occurrenceEntity.endDate
            this.finalizationReasonType = occurrenceEntity.finalizationReasonType?.name
            this.finalizationReasonDescription = occurrenceEntity.finalizationReasonDescription
        }
    }

    /**
     * Verifica se a ocorrência tem relação com um agendamento UPT e finaliza o mesmo
     */
    private fun finalizeRelatedUptSchedule(occurrenceEntity: OccurrenceEntity) {
        val scheduleUuid = occurrenceEntity.scheduleUuid
        if (scheduleUuid != null) {
            try {
                val checkupScheduleEntity = checkupScheduleRepository.getCheckupScheduleById(scheduleUuid)
                if (checkupScheduleEntity != null) {
                    // Atualizar o status da manutenção para FINISHED
                    checkupScheduleEntity.vehicleSchedule.maintenance = checkupScheduleEntity.vehicleSchedule.maintenance?.apply {
                        this.statusId = StepType.FINISHED.name
                        this.checkoutDate = occurrenceEntity.endDate
                        this.serviceOrder = occurrenceEntity.osNumber
                    } ?: run {
                        // Se não existe manutenção, criar uma nova
                        MaintenanceEntity().apply {
                            this.statusId = StepType.FINISHED.name
                            this.checkInDate = occurrenceEntity.createdAt
                            this.checkoutDate = occurrenceEntity.endDate
                            this.serviceOrder = occurrenceEntity.osNumber
                        }
                    }
                    
                    // Salvar as alterações no agendamento
                    checkupScheduleRepository.updateCheckupSchedule(checkupScheduleEntity)
                }
            } catch (e: Exception) {
                // Não lançar exceção para não interromper a finalização da ocorrência
            }
        }
    }

    private fun checkSameStep(occurrenceStepEntityList: List<OccurrenceStepEntity>, occurrenceStepUpdateRequest: OccurrenceStepChangeRequest): OccurrenceStepEntity? {
        val currentStep = getCurrentStep(occurrenceStepEntityList) ?: return null
        if(currentStep.stepId.name == occurrenceStepUpdateRequest.targetStepType!!.name) {
            throw BusinessException(
                ErrorCode.OCCURRENCE_STEP_SAME.toResponse()
            )
        }
        return currentStep
    }

    fun getCurrentStep(occurrenceStepEntityList:List<OccurrenceStepEntity>) : OccurrenceStepEntity? {
        return occurrenceStepEntityList.maxByOrNull {
            it.latest
        }
    }

    private fun finishStep(stepId: Int, user: User) {
        occurrenceStepRepository.findById(stepId).ifPresent { step ->
            step.dtEnd = LocalDateTime.now()
            step.latest = 0
            step.updatedBy
            step.updatedBy = user.firstName + " " + user.lastName
            step.updatedByUuid = user.accountId
            step.updatedAt = LocalDateTime.now()

            occurrenceStepRepository.save(step)
        }
    }

    private fun openStep(occurrenceUuid: String, stepType: StepTypeOccurrence, user: User) {
        val newStep = OccurrenceStepEntity(
            stepId = stepType,
            dtStart = LocalDateTime.now(),
            latest = 1,
            updatedBy = user.firstName + " " + user.lastName,
            updatedByUuid = user.accountId,
            updatedAt = LocalDateTime.now(),
            occurrence = occurrenceRepository.getOccurrenceByUuid(occurrenceUuid)!!
        )
        occurrenceStepRepository.save(newStep)
    }

    fun changeOccurrenceStep(occurrenceUuid: String, fromStepId: Int, toStepType: StepTypeOccurrence, usr: UserAuthenticate): OccurrenceEntity {
        val user = usersServiceImpl.getUserById(usr.userId)

        if(fromStepId != -1) finishStep(fromStepId, user)
        openStep(occurrenceUuid, toStepType, user)
        return occurrenceRepository.getOccurrenceByUuid(occurrenceUuid)
            ?: throw BusinessException(ErrorCode.OCCURRENCE_NOT_FOUND.toResponse())
    }
}

class OccurrenceStepChangeRequest {
    @NotNull
    var targetStepType:StepTypeOccurrence? = null
}

class UpdateStepChangeResponse {
   var estimatedTime:String? = null
   var report:String? = null
   var observation:String? = null
   var dtStart:LocalDateTime? = null
   var expectedDtEnd:LocalDateTime? = null
}

class FinalizeOccurrenceResponse {
    var endDate:LocalDateTime? = null
    var finalizationReasonType:String? = null
    var finalizationReasonDescription:String? = null
}