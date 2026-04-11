import Foundation

enum APIError: Error, LocalizedError {
    case invalidURL
    case networkError(Error)
    case decodingError(Error)
    case serverError(Int)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Ungültige URL"
        case .networkError(let error):
            return "Netzwerkfehler: \(error.localizedDescription)"
        case .decodingError(let error):
            return "Datenverarbeitungsfehler: \(error.localizedDescription)"
        case .serverError(let code):
            return "Serverfehler (Code \(code))"
        }
    }
}

actor APIService {
    static let shared = APIService()

    private let baseURL = "https://divelog.copilot.ovh/api"
    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        return d
    }()

    // MARK: - Dives

    func fetchDives() async throws -> [DiveLog] {
        try await get("/dives")
    }

    func createDive(_ dive: DiveLog) async throws -> DiveLog {
        try await post("/dives", body: dive)
    }

    func deleteDive(id: String) async throws {
        try await delete("/dives", params: ["id": id])
    }

    // MARK: - Equipment

    func fetchEquipment() async throws -> [EquipmentItem] {
        try await get("/equipment")
    }

    func createEquipment(_ item: EquipmentItem) async throws -> EquipmentItem {
        try await post("/equipment", body: item)
    }

    func deleteEquipment(id: String) async throws {
        try await delete("/equipment", params: ["id": id])
    }

    // MARK: - Sites

    func fetchSites() async throws -> [DiveSite] {
        try await get("/sites")
    }

    // MARK: - Notifications

    func fetchNotifications() async throws -> [NotificationItem] {
        try await get("/notifications")
    }

    // MARK: - Generic Helpers

    private func get<T: Decodable>(_ path: String) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            throw APIError.invalidURL
        }
        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            try validateResponse(response)
            return try decoder.decode(T.self, from: data)
        } catch let error as APIError {
            throw error
        } catch let error as DecodingError {
            throw APIError.decodingError(error)
        } catch {
            throw APIError.networkError(error)
        }
    }

    private func post<T: Codable>(_ path: String, body: T) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            throw APIError.invalidURL
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(body)

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            try validateResponse(response)
            return try decoder.decode(T.self, from: data)
        } catch let error as APIError {
            throw error
        } catch let error as DecodingError {
            throw APIError.decodingError(error)
        } catch {
            throw APIError.networkError(error)
        }
    }

    private func delete(_ path: String, params: [String: String]) async throws {
        var components = URLComponents(string: "\(baseURL)\(path)")
        components?.queryItems = params.map { URLQueryItem(name: $0.key, value: $0.value) }
        guard let url = components?.url else {
            throw APIError.invalidURL
        }
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"

        let (_, response) = try await URLSession.shared.data(for: request)
        try validateResponse(response)
    }

    private func validateResponse(_ response: URLResponse) throws {
        guard let httpResponse = response as? HTTPURLResponse else { return }
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError(httpResponse.statusCode)
        }
    }
}
