package br.com.vw.uptime.schedule.core.models.assistance

import java.time.LocalDateTime

class AssistanceHistoryResponse {
    lateinit var stateDescription:String
    lateinit var date: LocalDateTime
    lateinit var userHistory: UserHistoryResponse
}

class UserHistoryResponse {
    var accountId:String? = null
    var userId:String? = null
    var isTower:Boolean =  false
    var dealershipId:String? = null
    var dealershipName:String? = null
}