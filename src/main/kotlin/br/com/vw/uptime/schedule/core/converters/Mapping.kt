package br.com.vw.uptime.schedule.core.converters

import org.springframework.beans.BeanUtils

class Mapping {

    companion object {

        /**
         * Copy attributes from source to target
         * Returns the same target object with copied attributes.
         */
        fun <T:Any> copy(source:Any, target:T): T {
            BeanUtils.copyProperties(source, target)
            return target
        }
    }
}