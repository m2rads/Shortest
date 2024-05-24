//
//  AuthManager.swift
//  Shortest
//
//  Created by m2rads on 2024-05-20.
//

import Foundation

struct AppUser: Decodable {
    let uid: String
    let email: String?
    let accessToken: String?
}

class AuthManager {
    
    static let shared = AuthManager()
    
    private init() {}
    
    func getCurrentSession() async throws -> AppUser {
        let session = try await supabase.auth.session
        return AppUser(uid: session.user.id.uuidString, email: session.user.email, accessToken: session.accessToken)
    }
    
    func getCurrentSessionFromUrl(url: URL) async throws -> AppUser {
        let session = try await supabase.auth.session(from: url)
        return AppUser(uid: session.user.id.uuidString, email: session.user.email, accessToken: session.accessToken)
    }
    
    func registerNewUserWithEmail(email: String, password: String) async throws -> AppUser {
        let registrationRes = try await supabase.auth.signUp(email: email, password: password)
        guard let session = registrationRes.session else {
            print("No session when registering user")
            throw NSError()
        }
        return AppUser(uid: session.user.id.uuidString, email: session.user.email, accessToken: session.accessToken)
    }
    
    func signInWithMagicLink(email: String) async throws {
        try await supabase.auth.signInWithOTP(
            email: email,
            redirectTo: URL(string: "app.shortest://"),
            shouldCreateUser: false
        )
    }
    
    func signInWithEmail(email: String, password: String) async throws -> AppUser {
        let session = try await supabase.auth.signIn(email: email, password: password)
        return AppUser(uid: session.user.id.uuidString, email: session.user.email, accessToken: session.accessToken)
    }
    
    func signInWithApple(idToken: String, nonce: String) async throws -> AppUser {
        let session = try await supabase.auth.signInWithIdToken(credentials: .init(provider: .apple, idToken: idToken, nonce: nonce))
        return AppUser(uid: session.user.id.uuidString, email: session.user.email, accessToken: session.accessToken)
    }
    
    func signOut() async throws {
        try await supabase.auth.signOut()
    }
    
    func checkEmailExists(email: String) async throws -> Bool {
        do {
            print("email \(email)")
            let response = try await supabase
                .from("profiles")
                .select("*")
                .eq("email", value: email)
                .execute()

            let data = response.data
            print("fetch user data \(data)")
            
            let decoder = JSONDecoder()
            let users = try decoder.decode([AppUser].self, from: data)

            if users.count > 0 {
                // User exists
                print("User exists")
                return true
            } else {
                // User does not exist
                print("User does not exist")
                return false
            }
        } catch {
            print("Error: \(error.localizedDescription)")
            throw error
        }
    }

}
