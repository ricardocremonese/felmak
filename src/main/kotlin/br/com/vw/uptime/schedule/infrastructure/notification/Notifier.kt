package br.com.vw.uptime.schedule.infrastructure.notification

interface Notifier {
    fun     execute(notificationWrapper: NotificationWrapper)
}

data class NotificationWrapper(val message: String,
                               val title: String,
                               val from: MetadataNotification,
                               val to: MetadataNotification,
                               val link: String)
data class MetadataNotification(val id: String, val type: IdentifierType)
enum class IdentifierType {
    ASSET,
    USER
}