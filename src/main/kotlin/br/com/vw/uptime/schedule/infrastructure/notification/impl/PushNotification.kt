package br.com.vw.uptime.schedule.infrastructure.notification.impl

import br.com.vw.uptime.schedule.infrastructure.gateway.ContentRequest
import br.com.vw.uptime.schedule.infrastructure.gateway.MetadataRequest
import br.com.vw.uptime.schedule.infrastructure.gateway.PlatformNotificationGateway
import br.com.vw.uptime.schedule.infrastructure.gateway.PushNotificationRequest
import br.com.vw.uptime.schedule.infrastructure.notification.NotificationWrapper
import br.com.vw.uptime.schedule.infrastructure.notification.Notifier
import org.springframework.stereotype.Component

@Component
class PushNotification(private val platformNotificationGateway: PlatformNotificationGateway) : Notifier {

    override fun execute(notificationWrapper: NotificationWrapper) {
        val pushRequest = PushNotificationRequest(content = ContentRequest(notificationWrapper.message, notificationWrapper.title),
            sourceEntity = MetadataRequest(notificationWrapper.from.id, notificationWrapper.from.type.name),
            recipient = MetadataRequest(notificationWrapper.to.id, notificationWrapper.to.type.name),
            importance = "HIGH",
            link = notificationWrapper.link)

        //platformNotificationGateway.sendNotification(pushRequest)
    }
}