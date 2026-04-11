import Foundation

@MainActor
class EquipmentViewModel: ObservableObject {
    @Published var equipment: [EquipmentItem] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    func loadEquipment() async {
        isLoading = true
        errorMessage = nil
        do {
            equipment = try await APIService.shared.fetchEquipment()
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func deleteEquipment(_ item: EquipmentItem) async {
        do {
            try await APIService.shared.deleteEquipment(id: item.id)
            equipment.removeAll { $0.id == item.id }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
