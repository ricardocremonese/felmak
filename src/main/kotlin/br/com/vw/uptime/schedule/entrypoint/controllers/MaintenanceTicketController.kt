package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.core.enums.maintenance.StepType
import br.com.vw.uptime.schedule.core.models.ErrorCodeResponse
import br.com.vw.uptime.schedule.core.models.Page
import br.com.vw.uptime.schedule.core.models.maintenance.Inspection
import br.com.vw.uptime.schedule.core.models.maintenance.ticket.MaintenanceTicketRequest
import br.com.vw.uptime.schedule.core.models.maintenance.ticket.MaintenanceTicketResponse
import br.com.vw.uptime.schedule.core.models.maintenance.ticket.TicketStatusGroup
import br.com.vw.uptime.schedule.core.utils.exceptions.BusinessException
import br.com.vw.uptime.schedule.entrypoint.requests.*
import br.com.vw.uptime.schedule.entrypoint.responses.*
import br.com.vw.uptime.schedule.infrastructure.services.maintenance.*
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/v1/maintenance/ticket")
class MaintenanceTicketController(
    val maintenanceTicketServiceImpl: MaintenanceTicketServiceImpl,
    val ratingTicketService: RatingTicketService,
    val screeningTicketService: ScreeningTicketService,
    val repairTicketService: RepairTicketService,
    val inspectionTicketService: InspectionTicketService,
    val usrSvc : UserAuthServiceImpl,
    val releaseTicketService: ReleaseTicketService) {

    @PostMapping
    fun createTicket(@RequestBody maintenanceTicketRequest: MaintenanceTicketRequest) : MaintenanceTicketResponse {
        return maintenanceTicketServiceImpl.createTicket(maintenanceTicketRequest)
    }

    @GetMapping("/adjust-tickets")
    fun adjustTickets() {
        maintenanceTicketServiceImpl.adjustMaintenanceTickets()
    }

    @GetMapping("/{ticketId}")
    fun getTicket(@PathVariable("ticketId") ticketId:String) : MaintenanceTicketDetailResponse {
        return maintenanceTicketServiceImpl.getTicketDetails(ticketId)
    }

    @GetMapping("/{maintenanceScheduleId}/by-schedule-id")
    fun getTicketByScheduleId(@PathVariable("maintenanceScheduleId") maintenanceScheduleId:String) : MaintenanceTicketDetailResponse {
        return maintenanceTicketServiceImpl.getTicketDetailsByScheduleId(maintenanceScheduleId)
    }

    @PostMapping("/{ticketId}/checklist/checkup")
    fun changeCheckupChecklist(
        @PathVariable("ticketId") ticketId:String,
        @RequestBody checklist:List<ItemCheck>
    ): List<CheckupChecklistTicket> {
        return listOf()
    }

    @GetMapping("/all")
    fun getAllTickets(
        @RequestParam("page", defaultValue = "1") page:Int,
        @RequestParam("limit", defaultValue = "20") limit:Int,
        @RequestParam("sortDirection", defaultValue = "desc") sortDirection:String,
        @RequestParam("queryChassis", defaultValue = "") queryChassis:String,
        @RequestParam("date", defaultValue = "") date:String,
    ) : List<TicketItemResponse> {
        return maintenanceTicketServiceImpl.getAllTickets(
            page, 
            limit,
            sortDirection,
            queryChassis,
            date
        )
    }

    @GetMapping("/consultant-user")
    fun getAllByConsultantUser(
        @RequestParam("lastKey") lastKey:String?,
        @RequestParam("limit", defaultValue = "20") limit:Int,
        @RequestParam("statusGroup") ticketStatusGroup: TicketStatusGroup?,
        @RequestParam("sortDirection", defaultValue = "desc") sortDirection:String,
        @RequestParam("queryChassis", defaultValue = "") queryChassis:String,
        @RequestParam("date", defaultValue = "") date:String,
    ) : Page<TicketItemResponse> {
        return maintenanceTicketServiceImpl.ticketsByConsultantUser(
            usrSvc.usr(),
            date = date,
            ticketStatusGroup = ticketStatusGroup,
            queryChassis = queryChassis,
            limit = limit,
            sortDirection = sortDirection,
            encodedLastKey = lastKey,
        )
    }

    @GetMapping("/by-account")
    fun getAllByAccount(
        @RequestParam("lastKey") lastKey:String?,
        @RequestParam("limit", defaultValue = "20") limit:Int,
        @RequestParam("statusGroup") ticketStatusGroup: TicketStatusGroup?,
        @RequestParam("sortDirection", defaultValue = "desc") sortDirection:String,
        @RequestParam("queryChassis", defaultValue = "") queryChassis:String,
        @RequestParam("date", defaultValue = "") date:String,
    ) : Page<TicketItemResponse> {
        return maintenanceTicketServiceImpl.ticketsByAccountId(
            usrSvc.usr(),
            date = date,
            ticketStatusGroup = ticketStatusGroup,
            queryChassis = queryChassis,
            limit = limit,
            sortDirection = sortDirection,
            encodedLastKey = lastKey,
        )
    }

    @PostMapping("/by-chassis-list")
    fun getTicketsByChassisList(@RequestBody chassisRequest: ChassisRequest) : List<TicketItemResponse> {
        return maintenanceTicketServiceImpl.getTicketsByChassisList(chassisRequest.chassisList.filterNotNull().toSet())
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PatchMapping("/{ticketId}/rating")
    fun rateTicketService(@PathVariable("ticketId") ticketId: String,
                          @Valid @RequestBody ratingRequest: RatingRequest) {
        ratingTicketService.rateService(ticketId, ratingRequest)
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/{ticketId}/inspection")
    fun createInspection(
        @PathVariable("ticketId") ticketId: String,
        @Valid @RequestBody inspectionRequest: InspectionRequest
    ) {
        inspectionTicketService.createOrUpdateInspection(ticketId, inspectionRequest)
    }

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/{ticketId}/rating/{step}")
    fun getRating(@PathVariable("ticketId") ticketId: String, @PathVariable("step") step: StepType): RatingResponse {
        return ratingTicketService.getRating(ticketId, step)
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/{ticketId}/screening")
    fun createScreening(@PathVariable("ticketId")  ticketId: String,
                        @Valid @RequestBody screeningRequest: ScreeningRequest) {
        screeningTicketService.createOrUpdateScreening(ticketId, screeningRequest)
    }

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/{ticketId}/screening")
    fun getScreening(@PathVariable("ticketId")  ticketId: String): ScreeningResponse {
        return screeningTicketService.getScreeningById(ticketId)
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/{ticketId}/repair")
    fun createRepair(@PathVariable("ticketId")  ticketId: String,
                     @Valid @RequestBody repairRequest: RepairRequest) {
        repairTicketService.createOrUpdateRepair(ticketId, repairRequest)
    }

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/{ticketId}/repair")
    fun getTicketRepair(@PathVariable("ticketId")  ticketId: String) : RepairResponse {
        return repairTicketService.getTicketRepair(ticketId)
    }

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/{ticketId}/inspection")
    fun getTicketInspection(@PathVariable("ticketId")  ticketId: String) : Inspection {
        return inspectionTicketService.getInspection(ticketId)
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/{ticketId}/release")
    fun createTicketRelease(@PathVariable("ticketId")  ticketId: String,
                     @Valid @RequestBody releaseTicketRequest: ReleaseTicketRequest) {
        releaseTicketService.createOrUpdateRelease(ticketId, releaseTicketRequest)
    }

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/{ticketId}/release")
    fun getTicketRelease(@PathVariable("ticketId")  ticketId: String) : ReleaseTicketResponse {
        return releaseTicketService.getReleaseById(ticketId)
    }

    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/{ticketId}/{step}/checkout")
    fun checkoutTicket(
        @PathVariable("ticketId") ticketId: String,
        @PathVariable("step") step: String,
        @RequestBody checkoutRequest: CheckoutRequest
    ) {
        when(step.uppercase()) {
            StepType.TICKET.name -> maintenanceTicketServiceImpl.checkout(ticketId, checkoutRequest)
            StepType.SCREENING.name -> screeningTicketService.checkOut(ticketId, checkoutRequest)
            StepType.REPAIR.name -> repairTicketService.checkOut(ticketId, checkoutRequest)
            StepType.INSPECTION.name -> inspectionTicketService.checkOutInspection(ticketId, checkoutRequest)
            StepType.RELEASE.name -> releaseTicketService.checkOut(ticketId, checkoutRequest)
            else -> throw BusinessException(
                ErrorCodeResponse(HttpStatus.UNPROCESSABLE_ENTITY.value().toString(),
                "O {step} não possui um valor válido")
            )
        }
    }
}

class CheckupChecklistTicket {
    lateinit var name:String
    lateinit var items:Map<String, ItemServiceTicket>
}

class ItemServiceTicket {
    lateinit var name: String
    var ok:Boolean = false
}

class ItemCheck {
    lateinit var id:String
    var ok = false
}