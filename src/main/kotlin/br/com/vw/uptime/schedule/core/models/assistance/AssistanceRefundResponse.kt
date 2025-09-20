package br.com.vw.uptime.schedule.core.models.assistance

class AssistanceRefundResponse {
    lateinit var protocolNumber:String
    lateinit var customer:String
    lateinit var city:String
    lateinit var state:String
    lateinit var paidBy:String
    var releasePayment:Boolean = false
}