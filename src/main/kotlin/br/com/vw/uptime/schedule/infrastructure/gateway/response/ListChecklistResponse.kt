package br.com.vw.uptime.schedule.infrastructure.gateway.response

data class ListChecklistResponse(val data: List<Checklist>)

data class Checklist(val id: Long,
    val name: String,
    val type: Int,
    val active: Boolean)

data class Metadata(val currentPage: Int,
                    val from: Int,
                    val lastPage: Int,
                    val path: Int,
                    val perPage: Int,
                    val to: Int,
                    val total: Int)
