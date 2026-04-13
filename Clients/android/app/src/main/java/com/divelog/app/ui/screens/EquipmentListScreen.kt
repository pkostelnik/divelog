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
import com.divelog.app.data.model.EquipmentItem
import com.divelog.app.viewmodel.EquipmentViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EquipmentListScreen(viewModel: EquipmentViewModel = viewModel()) {
    val equipment by viewModel.equipment.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(Unit) { viewModel.loadEquipment() }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Ausrüstung") }) },
        floatingActionButton = {
            FloatingActionButton(onClick = { /* Equipment-Erstellen-Sheet öffnen */ }) {
                Icon(Icons.Default.Add, contentDescription = "Ausrüstung hinzufügen")
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
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(equipment) { item ->
                    EquipmentRow(item)
                }
            }
        }
    }
}

@Composable
fun EquipmentRow(item: EquipmentItem) {
    val statusColor = when (item.status) {
        "bereit" -> Color(0xFF4CAF50)
        "wartung" -> Color(0xFFFF9800)
        "defekt" -> Color(0xFFF44336)
        else -> Color.Gray
    }
    val statusLabel = when (item.status) {
        "bereit" -> "Bereit"
        "wartung" -> "Wartung"
        "defekt" -> "Defekt"
        else -> item.status
    }

    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text("${item.manufacturer} ${item.model}", style = MaterialTheme.typography.titleSmall)
                Text("SN: ${item.serialNumber}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Column(horizontalAlignment = androidx.compose.ui.Alignment.End) {
                Text(statusLabel, style = MaterialTheme.typography.labelMedium, color = statusColor)
                Text(item.lastService, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}
