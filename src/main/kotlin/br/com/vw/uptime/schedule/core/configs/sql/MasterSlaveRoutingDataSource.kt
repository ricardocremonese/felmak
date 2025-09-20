package br.com.vw.uptime.schedule.core.configs.sql

import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource

class MasterSlaveRoutingDataSource : AbstractRoutingDataSource() {
    override fun determineCurrentLookupKey(): Any? {
        return DatabaseContextHolder.environment
    }
}