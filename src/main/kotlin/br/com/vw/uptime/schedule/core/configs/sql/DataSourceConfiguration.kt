package br.com.vw.uptime.schedule.core.configs.sql

import com.zaxxer.hikari.HikariDataSource
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import javax.sql.DataSource

@Configuration
class DataSourceConfiguration {
    @Value("\${spring.datasource.write.url}")
    private val mstUrl: String? = null

    @Value("\${spring.datasource.write.username}")
    private val mstUsername: String? = null

    @Value("\${spring.datasource.write.password}")
    private val mstPassword: String? = null

    @Value("\${spring.datasource.read.url}")
    private val slaveUrl: String? = null

    @Value("\${spring.datasource.read.username}")
    private val slaveUsername: String? = null

    @Value("\${spring.datasource.read.password}")
    private val slavePassword: String? = null

    @Bean
    fun dataSource(): DataSource {
        val masterSlaveRoutingDataSource = MasterSlaveRoutingDataSource()
        val targetDataSources: MutableMap<Any, Any> = HashMap()
        targetDataSources[DatabaseEnvironment.UPDATABLE] = masterDataSource()
        targetDataSources[DatabaseEnvironment.READONLY] = slaveDataSource()
        masterSlaveRoutingDataSource.setTargetDataSources(targetDataSources)


        // Set as all transaction point to master 
        masterSlaveRoutingDataSource.setDefaultTargetDataSource(masterDataSource())
        return masterSlaveRoutingDataSource
    }

    fun slaveDataSource(): DataSource {
        val hikariDataSource = HikariDataSource()
        hikariDataSource.jdbcUrl = slaveUrl
        hikariDataSource.username = slaveUsername
        hikariDataSource.password = slavePassword
        return hikariDataSource
    }

    fun masterDataSource(): DataSource {
        val hikariDataSource = HikariDataSource()
        hikariDataSource.jdbcUrl = mstUrl
        hikariDataSource.username = mstUsername
        hikariDataSource.password = mstPassword
        return hikariDataSource
    }
}