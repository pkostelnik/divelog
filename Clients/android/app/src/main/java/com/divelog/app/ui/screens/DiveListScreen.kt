package com.divelog.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.divelog.app.data.model.DiveLog
import com.divelog.app.viewmodel.DiveViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiveListScreen(viewModel: DiveViewModel = viewModel()) {
    val dives by viewModel.dives.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(Unit) { viewModel.loadDives() }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Tauchgänge") }) },
        floatingActionButton = {
            FloatingActionButton(onClick = { /* Dive-Erstellen-Sheet öffnen */ }) {
                Icon(Icons.Default.Add, contentDescription = "Neuer Tauchgang")
            }
        }
    ) { padding ->
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize().padding(padding)) {
                CircularProgressIndicator(modifier = Modifier.align(androidx.compose.ui.Alignment.Center))
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(dives) { dive ->
                    DiveCard(dive)
                }
            }
        }
    }
}

@Composable
fun DiveCard(dive: DiveLog) {
    val difficultyColor = when (dive.difficulty) {
        "Beginner" -> Color(0xFF4CAF50)
        "Fortgeschritten" -> Color(0xFFFF9800)
        "Pro" -> Color(0xFFF44336)
        else -> Color.Gray
    }

    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(dive.title, style = MaterialTheme.typography.titleMedium)
                SuggestionChip(onClick = {}, label = { Text("#${dive.logNumber}") })
            }

            Text(dive.location, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)

            Spacer(modifier = Modifier.height(8.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Text("📅 ${dive.date}", style = MaterialTheme.typography.labelSmall)
                Text("⬇ ${dive.depth.toInt()}m", style = MaterialTheme.typography.labelSmall)
                Text("⏱ ${dive.duration} min", style = MaterialTheme.typography.labelSmall)
            }

            Spacer(modifier = Modifier.height(4.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("👥 ${dive.buddy}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                AssistChip(
                    onClick = {},
                    label = { Text(dive.difficulty, style = MaterialTheme.typography.labelSmall) },
                    colors = AssistChipDefaults.assistChipColors(containerColor = difficultyColor.copy(alpha = 0.15f))
                )
            }
        }
    }
}
