import SwiftUI

struct MainTabView: View {
    @Environment(\.horizontalSizeClass) var sizeClass

    var body: some View {
        if sizeClass == .regular {
            // iPad: Sidebar-Layout
            NavigationSplitView {
                SidebarView()
            } detail: {
                DashboardView()
            }
        } else {
            // iPhone: Tab-Layout
            TabView {
                DashboardView()
                    .tabItem {
                        Label("Dashboard", systemImage: "gauge.with.dots.needle.bottom.50percent")
                    }

                DiveListView()
                    .tabItem {
                        Label("Tauchgänge", systemImage: "water.waves")
                    }

                EquipmentListView()
                    .tabItem {
                        Label("Ausrüstung", systemImage: "wrench.and.screwdriver")
                    }

                DiveSiteMapView()
                    .tabItem {
                        Label("Tauchplätze", systemImage: "map")
                    }

                ProfileView()
                    .tabItem {
                        Label("Profil", systemImage: "person.circle")
                    }
            }
            .tint(.cyan)
        }
    }
}

struct SidebarView: View {
    var body: some View {
        List {
            NavigationLink(destination: DashboardView()) {
                Label("Dashboard", systemImage: "gauge.with.dots.needle.bottom.50percent")
            }
            NavigationLink(destination: DiveListView()) {
                Label("Tauchgänge", systemImage: "water.waves")
            }
            NavigationLink(destination: EquipmentListView()) {
                Label("Ausrüstung", systemImage: "wrench.and.screwdriver")
            }
            NavigationLink(destination: DiveSiteMapView()) {
                Label("Tauchplätze", systemImage: "map")
            }
            NavigationLink(destination: ProfileView()) {
                Label("Profil", systemImage: "person.circle")
            }
        }
        .navigationTitle("DiveLog")
    }
}

#Preview {
    MainTabView()
}
