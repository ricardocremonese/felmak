package br.com.vw.uptime.schedule.core.converters

import br.com.vw.uptime.schedule.entrypoint.responses.occurrence.StepResponse
import br.com.vw.uptime.schedule.infrastructure.entities.occurence.StepEntity

class StepConverter {

    companion object {

        fun entityToResponse(stepEntity: StepEntity) : StepResponse {
            return StepResponse().apply {
                this.id = stepEntity.id
                this.name = stepEntity.name
                this.elapsedHours = stepEntity.hoursElapsed
            }
        }

    }
}