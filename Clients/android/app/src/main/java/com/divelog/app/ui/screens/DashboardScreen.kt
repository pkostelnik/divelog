package com.divelog.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.divelog.app.data.model.DiveLog
import com.divelog.app.data.model.EquipmentItem
import com.divelog.app.viewmodel.DiveViewModel
import com.divelog.app.viewmodel.EquipmentViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    diveVM: DiveViewModel = viewModel(),
    equipmentVM: EquipmentViewModel = viewModel()
) {
    val dives by diveVM.dives.collectAsState()
    val equipment by equipmentVM.equipment.collectAsState()

    LaunchedEffect(Unit) {
        diveVM.loadDives()
        equipmentVM.loadEquipment()
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Dashboard") }) }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Stats
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard("Tauchgänge", "${dives.size}", Icons.Default.WaterDrop, modifier = Modifier.weight(1f))
                    StatCard("Ausrüstung", "${equipment.size}", Icons.Default.Build, modifier = Modifier.weight(1f))
                }
            }

            // Recent Dives
            item {
                Text("Letzte Tauchgänge", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 8.dp))
            }

            if (dives.isEmpty()) {
                item {
                    Card(modifier = Modifier.fillMaxWidth()) {
                        Text("Noch keine Tauchgänge vorhanden.", modifier = Modifier.padding(24.dp), style = MaterialTheme.typography.bodyMedium)
                    }
                }
            } else {
                items(dives.take(3)) { dive ->
                    DiveCard(dive)
                }
            }

            // Equipment
            item {
                Text("Ausrüstung", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 8.dp))
            }

            items(equipment.take(3)) { item ->
                EquipmentRow(item)
            }
        }
    }
}

@Composable
fun StatCard(title: String, value: String, icon: androidx.compose.ui.graphics.vector.ImageVector, modifier: Modifier = Modifier) {
    ElevatedCard(modifier = modifier) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.height(4.dp))
            Text(value, style = MaterialTheme.typography.headlineSmall)
            Text(title, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
