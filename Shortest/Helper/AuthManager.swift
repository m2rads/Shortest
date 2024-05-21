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
    
    func signInWithApple(idToken: String, nonce: String) async throws -> AppUser {
        let session = try await supabase.auth.signInWithIdToken(credentials: .init(provider: .apple, idToken: idToken, nonce: nonce))
        return AppUser(uid: session.user.id.uuidString, email: session.user.email)
    }
    
    func signOut() async throws {
        try await supabase.auth.signOut()
    }
    
}
