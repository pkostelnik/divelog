package com.divelog.app.data.model

import kotlinx.serialization.Serializable

@Serializable
data class DiveLog(
    val id: String,
    val type: String = "dive",
    val ownerId: String,
    val logNumber: Int,
    val title: String,
    val location: String,
    val depth: Double,
    val duration: Int,
    val date: String,
    val buddy: String,
    val difficulty: String,
    val siteId: String? = null,
    val diverId: String? = null
)

@Serializable
data class EquipmentItem(
    val id: String,
    val type: String = "equipment",
    val ownerId: String,
    val manufacturer: String,
    val model: String,
    val serialNumber: String,
    val status: String,
    val lastService: String
)

@Serializable
data class Coordinates(
    val latitude: Double,
    val longitude: Double
)

@Serializable
data class DiveSite(
    val id: String,
    val type: String = "site",
    val ownerId: String,
    val name: String,
    val country: String,
    val difficulty: String,
    val highlight: String,
    val coordinates: Coordinates
)

@Serializable
data class NotificationItem(
    val id: String,
    val type: String = "notification",
    val userId: String,
    val title: String,
    val description: String,
    val timestamp: String
)

@Serializable
data class MemberProfile(
    val id: String,
    val type: String = "user",
    val userId: String,
    val name: String,
    val email: String,
    val role: String,
    val joinedAt: String,
    val city: String,
    val about: String,
    val certifications: List<String>,
    val favoriteDiveSite: String,
    val completedDives: Int,
    val preferredLocale: String,
    val avatarUrl: String? = null
)
