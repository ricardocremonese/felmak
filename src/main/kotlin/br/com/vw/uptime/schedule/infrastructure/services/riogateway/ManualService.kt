package br.com.vw.uptime.schedule.infrastructure.services.riogateway

import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.requests.ManualRequest
import br.com.vw.uptime.schedule.infrastructure.gateway.CmsGateway
import br.com.vw.uptime.schedule.infrastructure.gateway.RioGateway
import br.com.vw.uptime.schedule.infrastructure.gateway.response.ManualDigitalResponse
import okhttp3.internal.format
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service

@Service
class ManualService(val rioGateway: RioGateway, val cmsGateway: CmsGateway) {
    fun getManual(type: String, manualRequest: ManualRequest): List<ManualDigitalResponse>? {

        if (manualRequest.chassi.isBlank()) {
            throw BusinessException(ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(),
                "O número do chassi não pode ser vazio"))
        }

        if (manualRequest.language.isBlank()) {
            throw BusinessException(ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(),
                "O idioma não pode ser vazio"))
        }

        return rioGateway.getManual(type, format("%s,%s", manualRequest.chassi, manualRequest.language))
    }

    fun getManual(chassis: String): ManualDigitalResponse {
        if (chassis.isBlank()) {
            throw BusinessException(ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(),
                "O número do chassi não pode ser vazio"))
        }

        val response = cmsGateway.getManual(chassis)
        if (response?.result == null){
            throw BusinessException(ErrorCodeResponse(HttpStatus.NOT_FOUND.value().toString(),
                "Nenhum manual foi localizado para o chassi: ${chassis}"))
        }

        return response
    }
}