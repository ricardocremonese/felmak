package br.com.vw.uptime.schedule.infrastructure.services.checkup

import br.com.vw.uptime.schedule.core.utils.Cached
import com.google.gson.GsonBuilder
import com.google.gson.reflect.TypeToken
import org.springframework.stereotype.Service

@Service
class ModelManualService {

    val cached = Cached<Map<String, String>> {
        val jsonGroupStr = String(javaClass.getResourceAsStream("/tmp/model-manual-map.json")?.readAllBytes()!!)
        val gson = GsonBuilder()
            .create()
        val mapType = object : TypeToken<Map<String, String>>() {}.type
        val jsonTree = gson.fromJson<Map<String, String>>(jsonGroupStr, mapType)
        jsonTree
    }


    fun modelCodeToModelManual(modelCode:String) : String? {
        val modelManualMap = cached.get()
        return modelManualMap[modelCode]
    }

}