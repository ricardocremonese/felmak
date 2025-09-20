package br.com.vw.uptime.schedule.core.utils.exceptions

import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse

class BusinessException(val errorCode: ErrorCodeResponse) : RuntimeException(errorCode.message)