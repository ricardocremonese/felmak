package br.com.vw.uptime.schedule.infrastructure.entities.occurence.analytics

interface StatsByDealership {
    fun getFantasyName() : String
    fun getDn() : String?
    fun getTotal() : Long?
    fun getAverageTime(): Long?
    fun getChassisList(): List<String>
}