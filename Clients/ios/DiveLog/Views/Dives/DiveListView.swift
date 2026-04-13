import SwiftUI

struct DiveListView: View {
    @StateObject private var viewModel = DiveViewModel()

    var body: some View {
        NavigationStack {
            List {
                ForEach(viewModel.dives) { dive in
                    DiveCardView(dive: dive)
                        .listRowSeparator(.hidden)
                        .listRowInsets(EdgeInsets(top: 4, leading: 16, bottom: 4, trailing: 16))
                }
                .onDelete { indexSet in
                    for index in indexSet {
                        let dive = viewModel.dives[index]
                        Task { await viewModel.deleteDive(dive) }
                    }
                }
            }
            .listStyle(.plain)
            .navigationTitle("Tauchgänge")
            .overlay {
                if viewModel.dives.isEmpty && !viewModel.isLoading {
                    ContentUnavailableView("Keine Tauchgänge", systemImage: "water.waves", description: Text("Noch keine Tauchgänge vorhanden."))
                }
            }
            .overlay {
                if viewModel.isLoading {
                    ProgressView()
                }
            }
            .refreshable {
                await viewModel.loadDives()
            }
            .task {
                await viewModel.loadDives()
            }
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        // Dive-Erstellen-Sheet öffnen
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
        }
    }
}

struct DiveCardView: View {
    let dive: DiveLog

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(dive.title)
                    .font(.headline)
                Spacer()
                Text("#\(dive.logNumber)")
                    .font(.caption.weight(.semibold))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(.ultraThinMaterial)
                    .clipShape(Capsule())
            }

            Text(dive.location)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            HStack(spacing: 16) {
                Label(dive.date, systemImage: "calendar")
                Label("\(Int(dive.depth))m", systemImage: "arrow.down.to.line")
                Label("\(dive.duration) min", systemImage: "clock")
            }
            .font(.caption)
            .foregroundStyle(.secondary)

            HStack {
                Label(dive.buddy, systemImage: "person.2")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
                Text(dive.difficulty.rawValue)
                    .font(.caption2.weight(.bold))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(difficultyColor.opacity(0.15))
                    .foregroundStyle(difficultyColor)
                    .clipShape(Capsule())
            }
        }
        .padding()
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var difficultyColor: Color {
        switch dive.difficulty {
        case .beginner: return .green
        case .intermediate: return .orange
        case .pro: return .red
        }
    }
}

#Preview {
    DiveListView()
}
