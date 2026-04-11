package com.divelog.app.viewmodel

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

class AuthViewModel : ViewModel() {
    private val _isAuthenticated = MutableStateFlow(false)
    val isAuthenticated = _isAuthenticated.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()

    fun login(email: String, password: String) {
        _isLoading.value = true
        _error.value = null
        // TODO: Echte API-Authentifizierung implementieren
        _isAuthenticated.value = true
        _isLoading.value = false
    }

    fun logout() {
        _isAuthenticated.value = false
    }
}
