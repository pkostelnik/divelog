import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @AppStorage("isDarkMode") private var isDarkMode = false
    @AppStorage("appLocale") private var appLocale = "de"

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack(spacing: 14) {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(.cyan)

                        VStack(alignment: .leading, spacing: 4) {
                            Text(authViewModel.currentUser?.name ?? "Taucher")
                                .font(.headline)
                            Text(authViewModel.currentUser?.email ?? "demo@divelog.app")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }

                Section("Einstellungen") {
                    Toggle(isOn: $isDarkMode) {
                        Label("Dunkelmodus", systemImage: "moon.fill")
                    }

                    Picker(selection: $appLocale) {
                        Text("Deutsch").tag("de")
                        Text("English").tag("en")
                    } label: {
                        Label("Sprache", systemImage: "globe")
                    }
                }

                Section("Statistiken") {
                    LabeledContent("Tauchgänge", value: "\(authViewModel.currentUser?.completedDives ?? 0)")
                    LabeledContent("Lieblings-Tauchplatz", value: authViewModel.currentUser?.favoriteDiveSite ?? "–")
                    LabeledContent("Mitglied seit", value: authViewModel.currentUser?.joinedAt ?? "–")
                }

                Section {
                    Button(role: .destructive) {
                        authViewModel.logout()
                    } label: {
                        Label("Abmelden", systemImage: "rectangle.portrait.and.arrow.right")
                    }
                }
            }
            .navigationTitle("Profil")
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
}
