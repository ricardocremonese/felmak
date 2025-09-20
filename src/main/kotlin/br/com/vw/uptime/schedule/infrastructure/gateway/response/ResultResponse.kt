package br.com.vw.uptime.schedule.infrastructure.gateway.response

data class ResultResponse(val transactionID: String?,
                          val bigTitle: String?,
                          val name: String?,
                          val media: String?,
                          val year: String?,
                          val chassis: String?,
                          val manuals: List<ManualResponse>?)
