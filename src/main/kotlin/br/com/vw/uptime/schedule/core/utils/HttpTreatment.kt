package br.com.vw.uptime.schedule.core.utils

import br.com.vw.uptime.schedule.core.enums.checkups.ErrorCode
import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import com.google.gson.GsonBuilder
import okhttp3.Response
import org.springframework.http.HttpStatus
import java.time.LocalDateTime

class HttpTreatment {

    companion object {
        fun throwIfNotSuccessful(response: Response) {
            if(!response.isSuccessful) {
                val strBody = response.body?.string()
                if(response.code == HttpStatus.UNPROCESSABLE_ENTITY.value()) {
                    throw BusinessException(
                        GsonBuilder()
                            .registerTypeAdapter(LocalDateTime::class.java, DateTimeDeserializer())
                            .create()
                            .fromJson(strBody, ErrorCodeResponse::class.java)
                    )
                }
                if(response.code == HttpStatus.NOT_FOUND.value()) {
                    throw BusinessException(
                        ErrorCode.ENTITY_NOT_FOUND.toResponse()
                    )
                } else {
                    throw Exception("Partner connection error V3. HttpStatus: ${response.code}; Body: $strBody")
                }
            }
        }

        fun throwIfNotSuccessful(response: Response, strBody:String?, msgError:String = "") {
            if(!response.isSuccessful) {
                if(response.code == HttpStatus.UNPROCESSABLE_ENTITY.value()) {
                    throw BusinessException(
                        GsonBuilder()
                            .registerTypeAdapter(LocalDateTime::class.java, DateTimeDeserializer())
                            .create()
                            .fromJson(strBody, ErrorCodeResponse::class.java)
                    )
                } else {
                    throw Exception("Partner connection error. Message: $msgError; HttpStatus: ${response.code}; Body: $strBody")
                }
            }
        }
    }

}