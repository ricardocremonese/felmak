package br.com.vw.uptime.schedule.infrastructure.repositories.schedule

import br.com.vw.uptime.schedule.core.models.schedule.input.RescheduleInput
import br.com.vw.uptime.schedule.core.models.schedule.input.Schedule
import br.com.vw.uptime.schedule.core.utils.DateTimeDeserializer
import br.com.vw.uptime.schedule.core.utils.DateTimeSerializer
import br.com.vw.uptime.schedule.core.utils.HttpTreatment
import br.com.vw.uptime.schedule.infrastructure.services.schedule.ScheduleInput
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
class ScheduleRepository(
    private val okHttpClient: OkHttpClient
) {

    @Value("\${schedule.url}")
    lateinit var url:String

    fun createSchedule(scheduleInput: ScheduleInput) : Schedule {
        val request = Request.Builder()
            .url("$url/schedule")
            .post(Gson()
                .newBuilder()
                .registerTypeAdapter(LocalDateTime::class.java, DateTimeSerializer())
                .create().toJson(scheduleInput).toRequestBody(MediaType.APPLICATION_JSON_VALUE.toMediaType()))
            //.addHeader("Authorization", "Bearer $token")
            .build()
        val response = okHttpClient.newCall(request)
            .execute()
        HttpTreatment.throwIfNotSuccessful(response)
        val strBody = response.body?.string()
        val schedule = GsonBuilder()
            .registerTypeAdapter(LocalDateTime::class.java, DateTimeDeserializer())
            .create()
            .fromJson(strBody, Schedule::class.java)
        return schedule
    }

    fun rejectSchedule(scheduleId:String) : Schedule {
        val request = Request.Builder()
            .url("$url/schedule/rejected/$scheduleId")
            .post(Gson()
                .newBuilder()
                .create().toJson("").toRequestBody(MediaType.APPLICATION_JSON_VALUE.toMediaType()))
            .build()
        val response = okHttpClient.newCall(request)
            .execute()
        HttpTreatment.throwIfNotSuccessful(response)
        val strBody = response.body?.string()
        val schedule = GsonBuilder()
            .registerTypeAdapter(LocalDateTime::class.java, DateTimeDeserializer())
            .create()
            .fromJson(strBody, Schedule::class.java)
        return schedule
    }

    fun reschedule(rescheduleInput: RescheduleInput) : Schedule {
        val request = Request.Builder()
            .url("$url/schedule/reschedule")
            .post(Gson()
                .newBuilder()
                .registerTypeAdapter(LocalDateTime::class.java, DateTimeSerializer())
                .create().toJson(rescheduleInput).toRequestBody(MediaType.APPLICATION_JSON_VALUE.toMediaType()))
            .build()
        val response = okHttpClient.newCall(request)
            .execute()
        HttpTreatment.throwIfNotSuccessful(response)
        val strBody = response.body?.string()
        val schedule = GsonBuilder()
            .registerTypeAdapter(LocalDateTime::class.java, DateTimeDeserializer())
            .create()
            .fromJson(strBody, Schedule::class.java)
        return schedule
    }

    fun acceptSchedule(checkupScheduleId: String): Schedule {

        val httpUrl = url.toHttpUrl()
            .newBuilder()
            .addPathSegment("schedule")
            .addPathSegment("accepted")
            .addEncodedPathSegment(checkupScheduleId)
            .build()
        val request = Request.Builder()
            .url(httpUrl)
            .post("".toRequestBody())
            .build()
        val response = okHttpClient.newCall(request)
            .execute()
        HttpTreatment.throwIfNotSuccessful(response)
        val strBody = response.body?.string()
        val schedule = GsonBuilder()
            .registerTypeAdapter(LocalDateTime::class.java, DateTimeDeserializer())
            .create()
            .fromJson(strBody, Schedule::class.java)
        return schedule
    }
}