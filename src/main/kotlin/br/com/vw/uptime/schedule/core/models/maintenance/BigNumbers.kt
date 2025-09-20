package br.com.vw.uptime.schedule.core.models.maintenance

import br.com.vw.uptime.schedule.infrastructure.services.checkup.PlanNumbers

class BigNumbers {
    var maintenance: MaintenanceBigNumbers = MaintenanceBigNumbers()
    var rioPlans: List<PlanNumbers> = ArrayList()
    //var vehiclePlans: List<PlanNumbers> = ArrayList()
    var volksTotal: VolksTotalBigNumbers = VolksTotalBigNumbers()
}