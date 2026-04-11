import SwiftUI

struct EquipmentListView: View {
    @StateObject private var viewModel = EquipmentViewModel()

    var body: some View {
        NavigationStack {
            List {
                ForEach(viewModel.equipment) { item in
                    EquipmentRowView(item: item)
                        .listRowSeparator(.hidden)
                        .listRowInsets(EdgeInsets(top: 4, leading: 16, bottom: 4, trailing: 16))
                }
                .onDelete { indexSet in
                    for index in indexSet {
                        let item = viewModel.equipment[index]
                        Task { await viewModel.deleteEquipment(item) }
                    }
                }
            }
            .listStyle(.plain)
            .navigationTitle("Ausrüstung")
            .overlay {
                if viewModel.equipment.isEmpty && !viewModel.isLoading {
                    ContentUnavailableView("Keine Ausrüstung", systemImage: "wrench.and.screwdriver", description: Text("Noch keine Ausrüstung erfasst."))
                }
            }
            .overlay {
                if viewModel.isLoading {
                    ProgressView()
                }
            }
            .refreshable {
                await viewModel.loadEquipment()
            }
            .task {
                await viewModel.loadEquipment()
            }
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        // TODO: Add equipment sheet
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
        }
    }
}

struct EquipmentRowView: View {
    let item: EquipmentItem

    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(statusColor)
                .frame(width: 10, height: 10)

            VStack(alignment: .leading, spacing: 4) {
                Text("\(item.manufacturer) \(item.model)")
                    .font(.subheadline.weight(.semibold))
                Text("SN: \(item.serialNumber)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text(statusLabel)
                    .font(.caption.weight(.bold))
                    .foregroundStyle(statusColor)
                Text(item.lastService)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var statusColor: Color {
        switch item.status {
        case .ready: return .green
        case .maintenance: return .orange
        case .defective: return .red
        }
    }

    private var statusLabel: String {
        switch item.status {
        case .ready: return "Bereit"
        case .maintenance: return "Wartung"
        case .defective: return "Defekt"
        }
    }
}

#Preview {
    EquipmentListView()
}
