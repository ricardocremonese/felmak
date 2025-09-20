package br.com.vw.uptime.schedule.infrastructure.repositories.checkup

import br.com.vw.uptime.schedule.core.models.maintenance.ComplementService
import br.com.vw.uptime.schedule.core.utils.Cached
import br.com.vw.uptime.schedule.core.utils.ResourceFile
import com.google.gson.JsonParser
import org.springframework.stereotype.Repository

@Repository
class ComplServiceRepository {

    val complementCached = Cached {
        loadComplementaryServices()
    }

    fun complementaryServicesById(id:String) : ComplementService {
        return complementCached.get().firstOrNull { it.id == id } ?: throw Exception("GroupType not found with the given id: $id")
    }

    private fun loadComplementaryServices() : List<ComplementService> {
        val checkupTypesJson = JsonParser.parseString(ResourceFile.fileToString("/tmp/complementary_services.json"))
        val types = checkupTypesJson.asJsonArray
        return types.map {
            val thisType = it.asJsonObject
            with(ComplementService()) {
                id = thisType.get("id").asString
                name = thisType.get("name").asString
                oil = if(thisType.has("oil") && !thisType.get("oil").isJsonNull) thisType.get("oil").asBoolean
                else
                    false
                this
            }
        }
    }
}