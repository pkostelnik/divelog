package com.divelog.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.divelog.app.data.api.ApiService
import com.divelog.app.data.model.DiveLog
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class DiveViewModel : ViewModel() {
    private val _dives = MutableStateFlow<List<DiveLog>>(emptyList())
    val dives = _dives.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()

    fun loadDives() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                _dives.value = ApiService.fetchDives()
            } catch (e: Exception) {
                _error.value = e.message
            }
            _isLoading.value = false
        }
    }

    fun deleteDive(dive: DiveLog) {
        viewModelScope.launch {
            try {
                ApiService.deleteDive(dive.id)
                _dives.value = _dives.value.filter { it.id != dive.id }
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }
}
