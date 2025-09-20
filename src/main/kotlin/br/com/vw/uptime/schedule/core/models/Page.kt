package br.com.vw.uptime.schedule.core.models

data class Page<T>(
    val items:List<T>,
    val lastKey:String?
)