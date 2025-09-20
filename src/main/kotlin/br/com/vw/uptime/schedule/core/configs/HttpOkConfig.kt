package br.com.vw.uptime.schedule.core.configs

import okhttp3.OkHttpClient
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.util.concurrent.TimeUnit

@Configuration
class HttpOkConfig {

    @Bean
    fun okHttpDefault():OkHttpClient {
        return OkHttpClient.Builder()
            .connectTimeout(90, TimeUnit.SECONDS)
            .readTimeout(90, TimeUnit.SECONDS)    // Read timeout
            .writeTimeout(90, TimeUnit.SECONDS)
            .build()
    }

}