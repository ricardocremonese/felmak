package br.com.vw.uptime.schedule.core.utils

class Cached<T>(
    private val execution: () -> T
) {

    private val lock = Any()
    private var value:T? = null

    fun get() : T {
        if(value == null) {
            synchronized(lock) {
                if(value == null) {
                    value = execution()
                }
            }
        }
        return value!!
    }

    fun isEmpty() : Boolean {
        return value == null
    }

    fun refresh() : T {
        value = null
        return get()
    }
}