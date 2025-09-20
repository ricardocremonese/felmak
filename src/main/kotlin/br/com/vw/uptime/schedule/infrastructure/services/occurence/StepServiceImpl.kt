package br.com.vw.uptime.schedule.infrastructure.services.occurence

import br.com.vw.uptime.schedule.core.converters.StepConverter
import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.requests.StepUpdateRequest
import br.com.vw.uptime.schedule.entrypoint.responses.occurrence.StepResponse
import br.com.vw.uptime.schedule.infrastructure.repositories.occurrence.StepRepository
import org.springframework.stereotype.Service

@Service
class StepServiceImpl(
    private val stepRepository: StepRepository
) {

    fun getAll() : List<StepResponse> {
        return stepRepository.findAll().map {
            StepConverter.entityToResponse(it)
        }
    }

    fun changeHoursElapsed(
        id:String,
        stepUpdateRequest:StepUpdateRequest
    ): StepResponse {
        val stepEntityOp = stepRepository.findById(id)
        if(stepEntityOp.isEmpty){
            throw BusinessException(ErrorCode.STEP_NOT_FOUND.toResponse())
        }
        val stepEntity = stepEntityOp.get()
        stepEntity.hoursElapsed = stepUpdateRequest.hoursElapsed
        return stepRepository.save(stepEntity).let {
            StepConverter.entityToResponse(it)
        }
    }
}