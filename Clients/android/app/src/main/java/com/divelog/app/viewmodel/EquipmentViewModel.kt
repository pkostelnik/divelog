package com.divelog.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.divelog.app.data.api.ApiService
import com.divelog.app.data.model.EquipmentItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class EquipmentViewModel : ViewModel() {
    private val _equipment = MutableStateFlow<List<EquipmentItem>>(emptyList())
    val equipment = _equipment.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()

    fun loadEquipment() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                _equipment.value = ApiService.fetchEquipment()
            } catch (e: Exception) {
                _error.value = e.message
            }
            _isLoading.value = false
        }
    }

    fun deleteEquipment(item: EquipmentItem) {
        viewModelScope.launch {
            try {
                ApiService.deleteEquipment(item.id)
                _equipment.value = _equipment.value.filter { it.id != item.id }
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }
}
