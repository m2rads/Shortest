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
}

class AuthManager {
    
    static let shared = AuthManager()
    
    private init() {}
    
    func getCurrentSession() async throws -> AppUser {
        let session = try await supabase.auth.session
        return AppUser(uid: session.user.id.uuidString, email: session.user.email)
    }
    
    func getCurrentSessionFromUrl(url: URL) async throws -> AppUser {
        let session = try await supabase.auth.session(from: url)
        return AppUser(uid: session.user.id.uuidString, email: session.user.email)
    }
    
    // MARK: Registration
    func registerNewUserWithEmail(email: String, password: String) async throws -> AppUser {
        let registrationRes = try await supabase.auth.signUp(email: email, password: password)
        guard let session = registrationRes.session else {
            print(" no session when registering user")
            throw NSError()
        }
        return AppUser(uid: session.user.id.uuidString, email: session.user.email)
    }
    
    // MARK: Sign In
    func signInWithMagicLink(email: String) async throws {
        try await supabase.auth.signInWithOTP(
            email: email,
            redirectTo: URL(string: "app.shortest://")
        )
    }
    
    func signInWithEmail(email: String, password: String) async throws -> AppUser {
        let session = try await supabase.auth.signIn(email: email, password: password)
        return AppUser(uid: session.user.id.uuidString, email: session.user.email)
        
    }
    
    func signInWithApple(idToken: String, nonce: String) async throws -> AppUser {
        let session = try await supabase.auth.signInWithIdToken(credentials: .init(provider: .apple, idToken: idToken, nonce: nonce))
        return AppUser(uid: session.user.id.uuidString, email: session.user.email)
    }
    
    func signOut() async throws {
        try await supabase.auth.signOut()
    }
    
}
