import SwiftUI
import MapKit

struct DiveSiteMapView: View {
    @State private var sites: [DiveSite] = []
    @State private var position: MapCameraPosition = .automatic

    var body: some View {
        NavigationStack {
            Map(position: $position) {
                ForEach(sites) { site in
                    Annotation(site.name, coordinate: CLLocationCoordinate2D(
                        latitude: site.coordinates.latitude,
                        longitude: site.coordinates.longitude
                    )) {
                        VStack(spacing: 2) {
                            Image(systemName: "mappin.circle.fill")
                                .font(.title)
                                .foregroundStyle(.cyan)
                            Text(site.name)
                                .font(.caption2.weight(.semibold))
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(.ultraThinMaterial)
                                .clipShape(Capsule())
                        }
                    }
                }
            }
            .mapStyle(.standard(elevation: .realistic))
            .navigationTitle("Tauchplätze")
            .task {
                do {
                    sites = try await APIService.shared.fetchSites()
                } catch {
                    print("Sites laden fehlgeschlagen: \(error)")
                }
            }
        }
    }
}

#Preview {
    DiveSiteMapView()
}
