package br.com.vw.uptime.schedule.core.utils

class ResourceFile {


    companion object {
        fun fileToString(resourceFileUrl: String): String {
            //val file = javaClass.getResourceAsStream(resourceFileUrl)?.toURI()?.let { File(it) }
            val inputStream = javaClass.getResourceAsStream(resourceFileUrl) ?: throw Exception("No $resourceFileUrl file found")
            return String(inputStream.readAllBytes())
        }
    }
}