import SwiftUI

struct DashboardView: View {
    @StateObject private var diveVM = DiveViewModel()
    @StateObject private var equipmentVM = EquipmentViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Stats
                    HStack(spacing: 12) {
                        StatCard(title: "Tauchgänge", value: "\(diveVM.dives.count)", icon: "water.waves", color: .cyan)
                        StatCard(title: "Ausrüstung", value: "\(equipmentVM.equipment.count)", icon: "wrench.and.screwdriver", color: .orange)
                    }
                    .padding(.horizontal)

                    // Recent Dives
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Letzte Tauchgänge")
                            .font(.headline)
                            .padding(.horizontal)

                        if diveVM.dives.isEmpty {
                            ContentUnavailableView("Keine Tauchgänge", systemImage: "water.waves", description: Text("Erstelle deinen ersten Tauchgang."))
                                .frame(height: 200)
                        } else {
                            ForEach(diveVM.dives.prefix(3)) { dive in
                                DiveCardView(dive: dive)
                                    .padding(.horizontal)
                            }
                        }
                    }

                    // Equipment Overview
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Ausrüstung")
                            .font(.headline)
                            .padding(.horizontal)

                        ForEach(equipmentVM.equipment.prefix(3)) { item in
                            EquipmentRowView(item: item)
                                .padding(.horizontal)
                        }
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Dashboard")
            .refreshable {
                await diveVM.loadDives()
                await equipmentVM.loadEquipment()
            }
            .task {
                await diveVM.loadDives()
                await equipmentVM.loadEquipment()
            }
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)
            Text(value)
                .font(.title.bold())
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

#Preview {
    DashboardView()
}
