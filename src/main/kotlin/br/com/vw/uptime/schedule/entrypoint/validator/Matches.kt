package br.com.vw.uptime.schedule.entrypoint.validator

import jakarta.validation.Constraint
import jakarta.validation.Payload
import kotlin.reflect.KClass

@Target(AnnotationTarget.FIELD)
@Constraint(validatedBy = [MatchesValidator::class])
@Retention(AnnotationRetention.RUNTIME)
annotation class Matches (
    val message: String = "",
    val regex: String = "",
    val groups: Array<KClass<Any>> = [],
    val payload: Array<KClass<Payload>> = []
)