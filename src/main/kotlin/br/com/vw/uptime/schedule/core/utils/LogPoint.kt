package br.com.vw.uptime.schedule.core.utils

import br.com.vw.uptime.schedule.core.filters.LoggingFilter
import org.slf4j.LoggerFactory

private val log = LoggerFactory.getLogger(LoggingFilter::class.java)

class LogPoint(
    private val message:String,
) {
    fun <REQ : Any, RES : Any?> log(requestObj:REQ?, logExecution: () -> RES):RES {
        val jsonLog = JsonLog().message(message)
        try {
            if (requestObj != null) {
                jsonLog.request(requestObj)
            }
            val resObj = ElapsedTime().start(
                { logExecution() },
                { elapsedTime -> jsonLog.elapsedTime(elapsedTime) }
            )
            jsonLog.response(resObj)
            log.debug(jsonLog.info())
            return resObj
        } catch (ex:Exception) {
            log.error(
                jsonLog
                .exception(ex)
                .error()
            )
            throw ex
        }
    }

    fun <RES : Any?> log(logExecution: () -> RES):RES {
        return log(null, logExecution)
    }

}