package br.com.vw.uptime.schedule.core.utils

class ElapsedTime {

    fun <T> start(execution:() -> T, elapsedResult: (Long) -> Unit):T {
        val start = System.currentTimeMillis()
        try {
            return execution()
        } finally {
            elapsedResult(System.currentTimeMillis() - start)
        }
    }
}

interface TimeExecution<T> {
    fun execute() : T
}