//
//  AuthManager.swift
//  Shortest
//
//  Created by m2rads on 2024-05-20.
//

import Foundation

struct AppUser {
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
    
    // MARK: Registration
    func registerNewUserWithEmail(email: String, password: String) async throws -> AppUser {
        let registrationRes = try await supabase.auth.signUp(email: email, password: password)
        guard let session = registrationRes.session else {
            print("No session when registering user")
            throw NSError()
        }
        return AppUser(uid: session.user.id.uuidString, email: session.user.email, accessToken: session.accessToken)
    }
    
    // MARK: Sign In
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
    
    func signInWithApple(idToken: String, nonce: String, email: String?) async throws -> AppUser {
            guard let email = email else {
                print("Email not provided by Apple ID.")
                throw NSError(domain: "SupabaseError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Email not provided by Apple ID."])
            }
            
            print("Attempting to sign in with Apple. ID Token: \(idToken), Nonce: \(nonce), Email: \(email)")
            let response = try await supabase.rpc("handle_apple_signin", params: ["email": email, "id_token": idToken, "nonce": nonce]).execute()
            
            let data = response.data
            
            let decoder = JSONDecoder()
            guard let result = try? decoder.decode([String: String].self, from: data) else {
                print("Failed to decode response.")
                throw NSError(domain: "SupabaseError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to decode response."])
            }
            
            if let status = result["status"], status == "success" {
                print("Apple sign-in successful: \(result)")
                let session = try await supabase.auth.session
                return AppUser(uid: session.user.id.uuidString, email: session.user.email, accessToken: session.accessToken)
            } else if let message = result["message"] {
                print("Apple sign-in failed: \(message)")
                throw NSError(domain: "SupabaseError", code: -1, userInfo: [NSLocalizedDescriptionKey: message])
            } else {
                print("Unknown error occurred.")
                throw NSError(domain: "SupabaseError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Unknown error occurred."])
            }
        }

    
    func signOut() async throws {
        try await supabase.auth.signOut()
    }
}
