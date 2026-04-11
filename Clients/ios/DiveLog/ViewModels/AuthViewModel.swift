import Foundation

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: MemberProfile?
    @Published var isLoading = false
    @Published var errorMessage: String?

    func login(email: String, password: String) {
        isLoading = true
        errorMessage = nil

        // TODO: Echte API-Authentifizierung implementieren
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
            self?.isAuthenticated = true
            self?.isLoading = false
        }
    }

    func logout() {
        isAuthenticated = false
        currentUser = nil
    }
}
