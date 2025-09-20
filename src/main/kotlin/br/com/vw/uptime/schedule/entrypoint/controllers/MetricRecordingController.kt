package br.com.vw.uptime.schedule.entrypoint.controllers

import br.com.vw.uptime.schedule.entrypoint.requests.MetricCreationRequest
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController


@RestController("/v1/metric-recording")
class MetricRecordingController {


    @PostMapping
    fun createMetricRecording(request: MetricCreationRequest): String {
        return "OK"
    }
}