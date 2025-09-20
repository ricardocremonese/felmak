package br.com.vw.uptime.schedule.core.models.attachment

import java.time.Instant

data class File(val name: String,
                val canonicalName: String,
                val updatedAt: Instant,
                val contentSize: Long,
                val contentType: String,
                val content: ByteArray?,
                val link: String?) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as File

        return canonicalName == other.canonicalName
    }

    override fun hashCode(): Int {
        return canonicalName.hashCode()
    }
}
