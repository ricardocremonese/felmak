package br.com.vw.uptime.schedule.core.configs.sql

enum class DatabaseEnvironment {
    UPDATABLE, READONLY
}

class  DatabaseContextHolder {
    companion object {
        private val CONTEXT = ThreadLocal<DatabaseEnvironment>()

        fun set(databaseEnvironment: DatabaseEnvironment) {
            CONTEXT.set(databaseEnvironment)
        }

        val environment: DatabaseEnvironment?
            get() = CONTEXT.get()

        fun reset() {
            CONTEXT.set(DatabaseEnvironment.UPDATABLE)
        }
    }
}