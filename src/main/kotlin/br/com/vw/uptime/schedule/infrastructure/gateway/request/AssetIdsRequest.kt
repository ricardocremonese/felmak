package br.com.vw.uptime.schedule.infrastructure.gateway.request

data class AssetIdsRequest(val assetIds: Set<String>)
data class AssetIdsNullRequest(val assetIds: Set<String>?)

data class AssetBigNumberRequest(
    val id:String,
    val identification:String?
)

data class AssetsRequest(
    val assets:Set<AssetBigNumberRequest>
)