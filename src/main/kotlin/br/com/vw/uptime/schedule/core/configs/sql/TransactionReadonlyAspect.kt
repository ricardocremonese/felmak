package br.com.vw.uptime.schedule.core.configs.sql

import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Aspect
@Component
@Order(0)
class TransactionReadonlyAspect {
    @Around("@annotation(transactional)")
    @Throws(Throwable::class)
    fun proceed(proceedingJoinPoint: ProceedingJoinPoint, transactional: Transactional): Any? {
        try {
            if (transactional.readOnly) {
                DatabaseContextHolder.set(DatabaseEnvironment.READONLY)
            }
            return proceedingJoinPoint.proceed()
        } finally {
            DatabaseContextHolder.reset()
        }
    }
}