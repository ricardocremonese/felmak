package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.core.models.Page
import br.com.vw.uptime.schedule.infrastructure.entities.consultant.ConsultantEntity
import br.com.vw.uptime.schedule.infrastructure.repositories.users.User
import br.com.vw.uptime.schedule.infrastructure.services.user.*
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import java.time.LocalDate

@RestController
@RequestMapping("/v1/users")
class UsersController(
    val consultantsServiceImpl: ConsultantsServiceImpl,
    val usrSvc : UserAuthServiceImpl,
    val usersServiceImpl: UsersServiceImpl,
    val userRoleService: UserRoleService
) {

    @GetMapping("/consultants")
    fun consultantsAndSchedules(date:LocalDate, dn:String) : List<ConsultantAndDates> {
        return consultantsServiceImpl.consultantsCheckups(date, dn)
    }

    @GetMapping("/consultants/all")
    fun getAllConsultants(
        @RequestParam("page", defaultValue = "0") page: Int,
        @RequestParam("limit", defaultValue = "20") limit: Int
    ): Page<Consultant> {
        return consultantsServiceImpl.getAllConsultantsWithPagination(page, limit)
    }

    @PostMapping("/consultants")
    fun changeConsultant(@RequestBody consultant:Consultant) : Consultant {
        return consultantsServiceImpl.changeConsultant(consultant)
    }

    @DeleteMapping("/consultants/{id}")
    fun deleteConsultant(@PathVariable("id") id: String): Map<String, String> {
        val deleted = consultantsServiceImpl.deleteConsultant(id)
        return if (deleted) {
            mapOf("message" to "Consultor deletado com sucesso")
        } else {
            mapOf("message" to "Erro ao deletar consultor")
        }
    }

    @GetMapping("/summary-schedule", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun checkupDealershipSchedules(date: LocalDate) : ConsultantAndDates {
        val consultant = with(ConsultantEntity()) {
            this.id = usrSvc.usr().userId
            this
        }
        return consultantsServiceImpl.consultantDataToConsultantAndDates(consultant, date)
    }

    @GetMapping("/{id}", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getUserById(@PathVariable("id") userId: String) : User {
        return usersServiceImpl.getUserById(userId)
    }

    @GetMapping("/role", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getUserRole() : UserRole {
        return userRoleService.getRoleByUserId(usrSvc.usr())
    }

    @GetMapping("/permissions/occurrence")
    fun getPermissions() : Map<String, String>? = usersServiceImpl.getPermissions(usrSvc.usr().userId,usrSvc.usr().accountId)
}