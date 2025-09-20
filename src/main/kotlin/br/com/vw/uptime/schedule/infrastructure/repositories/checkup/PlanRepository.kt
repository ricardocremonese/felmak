package br.com.vw.uptime.schedule.infrastructure.repositories.checkup

import br.com.vw.uptime.schedule.core.models.maintenance.ProductData
import br.com.vw.uptime.schedule.core.utils.HttpTreatment
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.google.gson.annotations.SerializedName
import com.google.gson.reflect.TypeToken
import jakarta.servlet.http.HttpServletRequest
import okhttp3.OkHttpClient
import okhttp3.Request
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Repository

@Repository
class PlanRepository(
    val okHttpClient: OkHttpClient,
    val httpServletRequest: HttpServletRequest
) {

    @Value("\${latam-marketplace.url}")
    lateinit var productUrl:String

    fun getActiveProducts() : List<ProductData> {
        val token = httpServletRequest.getHeader("Authorization")
        val request = Request.Builder()
            .url("$productUrl/v1/payment-gateway/products")
            .addHeader("Authorization", token)
            .build()
        val response = okHttpClient.newCall(request).execute()
        HttpTreatment.throwIfNotSuccessful(response)
        val strBody = response.body?.string()
        val gson = Gson()
        val listType = object : TypeToken<List<ProductData>>() {}.type
        val list = gson.fromJson<List<ProductData>>(strBody, listType)
        return list.filter {
            !it.name.contains("para plano Volkstotal") /*&& !it.name.contains("VolksBlocker")*/
        }
    }

    fun getAssetsAndPlans() : List<AssetPeriodData> {
        val token = httpServletRequest.getHeader("Authorization")
        val request = Request.Builder()
            .url("$productUrl/v1/payment-gateway/assets/periods")
            .addHeader("Authorization", token)
            .build()
        val response = okHttpClient.newCall(request).execute()
        HttpTreatment.throwIfNotSuccessful(response)
        val strBody = response.body?.string()
        val gson = Gson()
        // Parse the JSON object
        val jsonObject = gson.fromJson(strBody, JsonObject::class.java)
        // Extract the "items" array as a JSON string
        val itemsJson = jsonObject.getAsJsonArray("asset_periods")
        val listType = object : TypeToken<List<AssetPeriodData>>() {}.type
        val list = gson.fromJson<List<AssetPeriodData>>(itemsJson, listType)
        return list
    }

    fun getSubscriptions() : List<SubscriptionData> {
        return getAllSubscriptionsPaginated()
    }
    
    fun getAllSubscriptionsPaginated() : List<SubscriptionData> {
        return getAllSubscriptionsPaginated(httpServletRequest.getHeader("Authorization"))
    }
    
    fun getAllSubscriptionsPaginated(token: String) : List<SubscriptionData> {
        val allSubscriptions = mutableListOf<SubscriptionData>()
        var currentPage = 0
        val pageSize = 5000
        
        do {
            val request = Request.Builder()
                .url("$productUrl/v1/payment-gateway/subscriptions/tower/all?page=$currentPage&size=$pageSize")
                .addHeader("Authorization", token)
                .build()
            
            val response = okHttpClient.newCall(request).execute()
            
            if (response.code == 404) {
                break
            }
            
            HttpTreatment.throwIfNotSuccessful(response)
            val strBody = response.body?.string()
            val gson = Gson()
            
            val paginatedResponse = gson.fromJson(strBody, PaginatedSubscriptionsResponse::class.java)
            allSubscriptions.addAll(paginatedResponse.subscriptions)
            if (paginatedResponse.isLastPage) {
                break
            }
            
            currentPage++
        } while (true)
        
        return allSubscriptions
    }

}


data class AssetPeriodData(
    val sku: String,
    @SerializedName("product_name")
    val productName: String,
    val periods: List<PeriodData>,
)

data class PeriodData(
    @SerializedName("duration_period")
    val durationPeriod: Long,
    @SerializedName("duration_unit")
    val durationUnit: String,
    val description: String,
    val level: String,
    val assets: List<AssetData>,
)

data class AssetData(
    @SerializedName("asset_id")
    val assetId: String,
    val name: String,
)

data class SubscriptionData(
    @SerializedName("account_id")
    val accountId: String,
    val product: SubscriptionProductData,
    val assets: List<String>,
)

data class SubscriptionProductData(
    val sku: String,
    val name: String,
)

data class PaginatedSubscriptionsResponse(
    val subscriptions: List<SubscriptionData>,
    @SerializedName("is_last_page")
    val isLastPage: Boolean
)