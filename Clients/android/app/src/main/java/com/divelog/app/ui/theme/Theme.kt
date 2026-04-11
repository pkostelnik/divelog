package com.divelog.app.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val OceanCyan = Color(0xFF06B6D4)
private val OceanDark = Color(0xFF0891B2)
private val OceanLight = Color(0xFFE0F7FA)

private val LightColorScheme = lightColorScheme(
    primary = OceanCyan,
    onPrimary = Color.White,
    primaryContainer = OceanLight,
    onPrimaryContainer = OceanDark,
    secondary = Color(0xFF4DB6AC),
    surface = Color.White,
    background = Color(0xFFF8FAFC)
)

private val DarkColorScheme = darkColorScheme(
    primary = OceanCyan,
    onPrimary = Color.White,
    primaryContainer = Color(0xFF0C1F2E),
    onPrimaryContainer = OceanLight,
    secondary = Color(0xFF4DB6AC),
    surface = Color(0xFF0F172A),
    background = Color(0xFF0C1F2E)
)

@Composable
fun DiveLogTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
