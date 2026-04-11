import Foundation

@MainActor
class DiveViewModel: ObservableObject {
    @Published var dives: [DiveLog] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    func loadDives() async {
        isLoading = true
        errorMessage = nil
        do {
            dives = try await APIService.shared.fetchDives()
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func deleteDive(_ dive: DiveLog) async {
        do {
            try await APIService.shared.deleteDive(id: dive.id)
            dives.removeAll { $0.id == dive.id }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
