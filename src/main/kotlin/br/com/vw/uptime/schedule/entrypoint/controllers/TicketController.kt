package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.core.enums.checkups.CheckupTypeScheduleEnum
import br.com.vw.uptime.schedule.core.enums.schedule.InviterType
import br.com.vw.uptime.schedule.infrastructure.services.maintenance.PaginatedTicketsResponse
import br.com.vw.uptime.schedule.infrastructure.services.maintenance.TicketService
import br.com.vw.uptime.schedule.infrastructure.services.user.UserAuthServiceImpl
import jakarta.validation.constraints.Max
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
@RequestMapping("/v1/ticket")
class TicketController (val ticketService: TicketService,
                        val usrSvc : UserAuthServiceImpl){
    @GetMapping("/history/manager", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getManagerScheduleHistory(@RequestParam("pageSize", defaultValue = "5" ) @Max(15, message = "O valor máximo para paginação é 15 registros") pageSize: Int,
                                  @RequestParam("cursor") cursor: Optional<String>,
                                  @RequestParam("type") type: Optional<CheckupTypeScheduleEnum>
    ) : PaginatedTicketsResponse {

        return ticketService.getTicketsHistory(usrSvc.usr().accountId, pageSize, cursor, type, InviterType.MANAGER)
    }

    @GetMapping("/history/consultant", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getConsultantScheduleHistory(@RequestParam("pageSize", defaultValue = "5" ) @Max(15, message = "O valor máximo para paginação é 15 registros") pageSize: Int,
                                     @RequestParam("cursor") cursor: Optional<String>,
                                     @RequestParam("type") type: Optional<CheckupTypeScheduleEnum>
    ) : PaginatedTicketsResponse {

        return ticketService.getTicketsHistory(usrSvc.usr().userId, pageSize, cursor, type, InviterType.CONSULTANT)
    }
}