package br.com.vw.uptime.schedule.core.converters

import br.com.vw.uptime.schedule.infrastructure.notification.IdentifierType
import br.com.vw.uptime.schedule.infrastructure.notification.MetadataNotification
import br.com.vw.uptime.schedule.infrastructure.notification.NotificationWrapper

class NotificationWrapperConverter {
   companion object {
       fun fromSchedule(checkupScheduleId: String, protocol: String, sourceUserId: String, consultantId: String): NotificationWrapper {
           return NotificationWrapper(
               title = "Confirmaçãode agendamento",
               message = "Você possui um novo agendamento com número de protocolo $protocol",
               from = MetadataNotification(sourceUserId, IdentifierType.USER),
               to = MetadataNotification(consultantId, IdentifierType.USER),
               link = "https://latam-uptime-gateway.rio.cloud/fleet-manager/my-appointments/$checkupScheduleId"
           )
       }
   }
}