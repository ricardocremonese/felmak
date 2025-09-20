package br.com.vw.uptime.schedule.core.configs

import io.awspring.cloud.dynamodb.DynamoDbTableNameResolver
import org.springframework.beans.factory.annotation.Value

class NormalizeDynamoDbTableNameResolver : DynamoDbTableNameResolver {

    @Value("\${aws.dynamodb.suffix}")
    private lateinit var dynamoSuffixTable: String

    override fun <T : Any?> resolve(clazz: Class<T>): String {
        val className = clazz.simpleName
        val classNameNoEntity = className.removeSuffix("Entity")
        val tableNameStartLowercase = classNameNoEntity.replaceFirstChar { it.lowercase() }
        val tableNameEnvironment = tableNameStartLowercase + getSuffixFromEnv(dynamoSuffixTable)
        return tableNameEnvironment
    }

    companion object {
        private fun getSuffixFromEnv(dynamoSuffixTable:String) : String {
            return dynamoSuffixTable
        }

        fun tableWithEnv(tableName:String, suffixTableName:String) : String {
            return tableName + getSuffixFromEnv(suffixTableName)
        }
    }


}