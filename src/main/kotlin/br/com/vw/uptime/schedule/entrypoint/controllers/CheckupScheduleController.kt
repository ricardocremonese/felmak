package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.core.enums.checkups.CheckupScheduleState
import br.com.vw.uptime.schedule.core.enums.schedule.ScheduleStateEnum
import br.com.vw.uptime.schedule.core.models.Page
import br.com.vw.uptime.schedule.core.models.maintenance.CheckupSchedule
import br.com.vw.uptime.schedule.entrypoint.requests.ChassisRequest
import br.com.vw.uptime.schedule.entrypoint.requests.CheckupScheduleRequest
import br.com.vw.uptime.schedule.entrypoint.requests.RescheduleRequest
import br.com.vw.uptime.schedule.infrastructure.services.checkup.CheckupScheduleCreationServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.checkup.CheckupScheduleServiceImpl
import br.com.vw.uptime.schedule.infrastructure.services.maintenance.Status
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("v1/schedules/checkups")
class CheckupScheduleController(
    val checkupScheduleServiceImpl:CheckupScheduleServiceImpl,
    val checkupScheduleCreationServiceImpl: CheckupScheduleCreationServiceImpl,
    val usrSvc : UserAuthServiceImpl
) {

    private val log = LoggerFactory.getLogger(CheckupScheduleController::class.java)

    @PostMapping(consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun createSchedule(@Valid @RequestBody checkupScheduleRequest: CheckupScheduleRequest): CheckupSchedule {
        return checkupScheduleCreationServiceImpl.createCheckupSchedule(checkupScheduleRequest, usrSvc.usr())
    }

    @GetMapping("/all", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getAllcheckupSchedules(
        @RequestParam("lastKey") lastKey:String?,
        @RequestParam("limit", defaultValue = "20") limit:Int,
        @RequestParam("sortDirection", defaultValue = "desc") sortDirection:String,
        @RequestParam("queryChassis", defaultValue = "") queryChassis:String,
        @RequestParam("date", defaultValue = "") date:String,
        @RequestParam("month", required = false) month:Int?,
        @RequestParam("year", required = false) year:Int?,
    ) : Page<CheckupSchedule> {
        return checkupScheduleServiceImpl.getAllCheckupSchedules(
            usrSvc.usr().accountId,
            checkupScheduleState = CheckupScheduleState.PENDING,
            date = date,
            queryChassis = queryChassis,
            limit = limit,
            sortDirection = sortDirection,
            encodedLastKey = lastKey,
            month = month,
            year = year
        )
    }

    @GetMapping("/all/actives", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun checkupAllActiveSchedules(
        @RequestParam("page", defaultValue = "1") page:Int,
        @RequestParam("limit", defaultValue = "20") limit:Int
    ) : List<CheckupSchedule> {
        return checkupScheduleServiceImpl.getAllActiveCheckupSchedules(page, limit)
    }

    @GetMapping(produces = [MediaType.APPLICATION_JSON_VALUE])
    fun checkupSchedules(month:Int, year:Int) : List<CheckupSchedule> {
        return checkupScheduleServiceImpl.getSchedulesByMonthYear(month, year)
    }
    
    @GetMapping("/consultant", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun checkupDealershipSchedules(day: Optional<Int>, month:Int, year:Int) : List<CheckupSchedule> {
        return checkupScheduleServiceImpl.getConsultantSchedulesByMonthYear(day, month, year)
    }

    @GetMapping("/schedules-by-account", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getSchedulesByAccountId() : List<CheckupSchedule> {
        return checkupScheduleServiceImpl.getSchedulesByAccountId(usrSvc.usr().accountId)
    }

    @GetMapping("/schedules-by-user", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getSchedulesByUser() : List<CheckupSchedule> {
        return checkupScheduleServiceImpl.getSchedulesByUserId(usrSvc.usr())
    }

    @GetMapping("/schedules-by-consultant", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getSchedulesByConsultantUser(
        @RequestParam("pageNumber", defaultValue = "1") pageNumber:Int,
        @RequestParam("limit", defaultValue = "20") limit:Int,
        @RequestParam("wasViewed", defaultValue = "true") wasViewed: Boolean,
    ) : List<CheckupSchedule> {
        return checkupScheduleServiceImpl.getSchedulesByConsultantUser(usrSvc.usr(), pageNumber, limit, wasViewed)
    }

    @GetMapping("/by-consultant", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getSchedulesByConsultant(
        @RequestParam("lastKey") lastKey:String?,
        @RequestParam("limit", defaultValue = "20") limit:Int,
        @RequestParam("sortDirection", defaultValue = "desc") sortDirection:String,
        @RequestParam("queryChassis", defaultValue = "") queryChassis:String,
        @RequestParam("date", defaultValue = "") date:String,
    ) : Page<CheckupSchedule> {
        return checkupScheduleServiceImpl.getSchedulesByConsultantId(
            usrSvc.usr(),
            checkupScheduleState = CheckupScheduleState.PENDING,
            date = date,
            queryChassis = queryChassis,
            limit = limit,
            sortDirection = sortDirection,
            encodedLastKey = lastKey
        )
    }

    @GetMapping("/consultant/latest", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getSchedulesByUserId() : List<CheckupSchedule> {
        return checkupScheduleServiceImpl.getLatestSchedulesByUserId(usrSvc.usr().userId)
    }

    @PostMapping("/accepted/{id}", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun acceptSchedule(@PathVariable("id") checkupScheduleId:String) {
        checkupScheduleServiceImpl.acceptSchedule(checkupScheduleId)
    }
    
    @PostMapping("/cancel/{id}", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun cancelSchedule(@PathVariable("id") checkupScheduleId:String) {
        checkupScheduleServiceImpl.cancelSchedule(checkupScheduleId)
    }

    @PostMapping("/reschedule", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun reschedule(@Valid @RequestBody rescheduleRequest: RescheduleRequest) {
        checkupScheduleServiceImpl.reschedule(rescheduleRequest)
    }
    
    @GetMapping("/{id}", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getScheduleById(@PathVariable("id") checkupScheduleId:String) : CheckupSchedule {
        return checkupScheduleServiceImpl.getScheduleById(checkupScheduleId)
    }

    @PostMapping("/by-vehicle-chassis", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun checkupScheduleByVehicleChassisList(@RequestBody chassisRequest: ChassisRequest): List<CheckupSchedule> {
        return checkupScheduleServiceImpl.checkupScheduleByVehicleChassis(chassisRequest.chassisList.filterNotNull().toSet(), ScheduleStateEnum.REJECTED.state())
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PatchMapping("/{id}/view", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getSchedulesByConsultant(@PathVariable("id") checkupScheduleId:String) {
        log.info("Atualizar agendamento com id $checkupScheduleId para já visualizado pelo consultor")
        return checkupScheduleServiceImpl.updateNotificationVisibility(checkupScheduleId)
    }

    @PostMapping("/schedule-adjustments", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun adjust(){
        checkupScheduleCreationServiceImpl.adjustSchedules()
    }

    @GetMapping("/validate/{chassis}", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun validateCheckupScheduled(@PathVariable("chassis") chassis: String): Status {
        return checkupScheduleServiceImpl.validateCheckupScheduled(chassis)
    }
}