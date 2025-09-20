package br.com.vw.uptime.schedule.infrastructure.services.asset

import br.com.vw.uptime.schedule.infrastructure.repositories.assets.AssociationData
import br.com.vw.uptime.schedule.infrastructure.repositories.assets.AssociationRepository
import org.springframework.stereotype.Service

@Service
class AssociationService(
    val associationRepository: AssociationRepository
) {

    fun allAssociations() : List<AssociationData> {
        val allAssociations = arrayListOf<AssociationData>()
        var after:String? = null
        do {
            val currentAssets = associationRepository.getAssociations(after)
            after = currentAssets.lastOrNull()?.id
            allAssociations.addAll(currentAssets)
        } while (after != null)
        return allAssociations
    }

    fun associationByAssetId(assetId:String, associationList:List<AssociationData>) : AssociationData?  {
        return associationList.firstOrNull {
            it.assetId == assetId
        }
    }

}