package br.com.vw.uptime.schedule.entrypoint.responses

import java.time.Instant
import kotlin.properties.Delegates

class FileResponse {
    lateinit var name: String
    var  contentSize by Delegates.notNull<Long>()
    lateinit var updatedAt: Instant
    lateinit var contentType: String
    lateinit var link: String
}
