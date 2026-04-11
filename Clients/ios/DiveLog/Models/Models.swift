import Foundation

enum Difficulty: String, Codable, CaseIterable {
    case beginner = "Beginner"
    case intermediate = "Fortgeschritten"
    case pro = "Pro"
}

struct DiveLog: Codable, Identifiable {
    let id: String
    let type: String
    let ownerId: String
    var logNumber: Int
    var title: String
    var location: String
    var depth: Double
    var duration: Int
    var date: String
    var buddy: String
    var difficulty: Difficulty
    var siteId: String?
    var diverId: String?
}

enum EquipmentStatus: String, Codable, CaseIterable {
    case ready = "bereit"
    case maintenance = "wartung"
    case defective = "defekt"
}

struct EquipmentItem: Codable, Identifiable {
    let id: String
    let type: String
    let ownerId: String
    var manufacturer: String
    var model: String
    var serialNumber: String
    var status: EquipmentStatus
    var lastService: String
}

struct Coordinates: Codable {
    let latitude: Double
    let longitude: Double
}

struct DiveSite: Codable, Identifiable {
    let id: String
    let type: String
    let ownerId: String
    var name: String
    var country: String
    var difficulty: Difficulty
    var highlight: String
    var coordinates: Coordinates
}

struct NotificationItem: Codable, Identifiable {
    let id: String
    let type: String
    let userId: String
    var title: String
    var description: String
    var timestamp: String
}

struct MemberProfile: Codable, Identifiable {
    let id: String
    let type: String
    let userId: String
    var name: String
    var email: String
    var role: String
    var joinedAt: String
    var city: String
    var about: String
    var certifications: [String]
    var favoriteDiveSite: String
    var completedDives: Int
    var preferredLocale: String
    var avatarUrl: String?
}
