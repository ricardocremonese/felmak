package br.com.vw.uptime.schedule.entrypoint.requests

class MetricCreationRequest {
    lateinit var chassis:String
    var odometer:Double? = null
    var hourMeter:Double? = null
}