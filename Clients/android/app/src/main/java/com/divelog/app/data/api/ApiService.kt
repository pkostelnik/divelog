package com.divelog.app.data.api

import com.divelog.app.data.model.*
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.android.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

object ApiService {

    private const val BASE_URL = "https://divelog.copilot.ovh/api"

    private val client = HttpClient(Android) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
    }

    // Dives
    suspend fun fetchDives(): List<DiveLog> =
        client.get("$BASE_URL/dives").body()

    suspend fun createDive(dive: DiveLog): DiveLog =
        client.post("$BASE_URL/dives") {
            contentType(ContentType.Application.Json)
            setBody(dive)
        }.body()

    suspend fun deleteDive(id: String) {
        client.delete("$BASE_URL/dives") {
            parameter("id", id)
        }
    }

    // Equipment
    suspend fun fetchEquipment(): List<EquipmentItem> =
        client.get("$BASE_URL/equipment").body()

    suspend fun createEquipment(item: EquipmentItem): EquipmentItem =
        client.post("$BASE_URL/equipment") {
            contentType(ContentType.Application.Json)
            setBody(item)
        }.body()

    suspend fun deleteEquipment(id: String) {
        client.delete("$BASE_URL/equipment") {
            parameter("id", id)
        }
    }

    // Sites
    suspend fun fetchSites(): List<DiveSite> =
        client.get("$BASE_URL/sites").body()

    // Notifications
    suspend fun fetchNotifications(): List<NotificationItem> =
        client.get("$BASE_URL/notifications").body()
}
