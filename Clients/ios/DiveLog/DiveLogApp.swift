import SwiftUI

@main
struct DiveLogApp: App {
    @StateObject private var authViewModel = AuthViewModel()
    @AppStorage("isDarkMode") private var isDarkMode = false
    @AppStorage("appLocale") private var appLocale = "de"

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authViewModel)
                .preferredColorScheme(isDarkMode ? .dark : .light)
        }
    }
}
