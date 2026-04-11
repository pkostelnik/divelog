package com.divelog.app

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import com.divelog.app.viewmodel.AuthViewModel
import com.divelog.app.ui.screens.LoginScreen
import com.divelog.app.ui.navigation.MainNavigation

@Composable
fun DiveLogApp(authViewModel: AuthViewModel = viewModel()) {
    val isAuthenticated by authViewModel.isAuthenticated.collectAsState()

    if (isAuthenticated) {
        MainNavigation()
    } else {
        LoginScreen(authViewModel = authViewModel)
    }
}
