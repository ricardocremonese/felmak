package br.com.vw.uptime.schedule.entrypoint.validator

import jakarta.validation.ConstraintValidator
import jakarta.validation.ConstraintValidatorContext

class MatchesValidator : ConstraintValidator<Matches, String> {
    private lateinit var regexValidator : String

    override fun initialize(constraintAnnotation: Matches?) {
        regexValidator = constraintAnnotation!!.regex
    }

    override fun isValid(value: String?, context: ConstraintValidatorContext?): Boolean {
        return value?.matches(Regex(regexValidator)) ?: return true
    }
}