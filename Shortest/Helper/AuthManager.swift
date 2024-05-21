//
//  AuthManager.swift
//  Shortest
//
//  Created by m2rads on 2024-05-20.
//

import Foundation


class AuthManager {
    
    static let shared = AuthManager()
    
    private init() {}
    
    func signInWithApple(idToken: String, nonce: String) async throws {
        let session = try await supabase.auth.signInWithIdToken(credentials: .init(provider: .apple, idToken: idToken, nonce: nonce))
        print(session)
        print(session.user)
    }
    
}
