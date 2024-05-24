//
//  SignInViewModel.swift
//  Shortest
//
//  Created by m2rads on 2024-05-20.
//

import Foundation

@MainActor
class SignInViewModel: ObservableObject {
    let appleSignIn = AppleSignIn()
    
    func isFormValid(email: String, password: String) -> Bool {
        guard email.isValidEmail(), password.count < 8 else {
            return false
        }
        return true
    }
    
    func getCurrentSessionFromUrl(Url: URL) async throws -> AppUser {
        return try await AuthManager.shared.getCurrentSessionFromUrl(url: Url)
    }
    
    func signInWithMagicLink(email: String) async throws {
        if email.isValidEmail() {
            try await AuthManager.shared.signInWithMagicLink(email: email)
        } else {
            print("Registration email is invalid")
            throw NSError()
        }
    }
    
    func registerNewUserWith(email: String, password: String) async throws -> AppUser {
        if isFormValid(email: email, password: password) {
            return try await AuthManager.shared.registerNewUserWithEmail(email: email, password: password)
        } else {
            print("Registration form is invalid")
            throw NSError()
        }
    }
    
    func signInWithEmail(email: String, password: String) async throws -> AppUser {
        if isFormValid(email: email, password: password) {
            return try await AuthManager.shared.signInWithEmail(email: email, password: password)
        } else {
            print("Registration form is invalid")
            throw NSError()
        }

    }
    
    func signInWithApple() async throws -> AppUser {
        let appleResult = try await appleSignIn.startSignInWithAppleFlow()
        
        // Extract email from AppleSignInResult
        let email = "" // Extract email from appleResult (ensure you have access to it)
        
        // Check if the email exists in the database
        let emailExists = try await AuthManager.shared.checkEmailExists(email: email)
        guard emailExists else {
            throw NSError(domain: "Email not found", code: 404, userInfo: nil)
        }
        
        return try await AuthManager.shared.signInWithApple(idToken: appleResult.idToken, nonce: appleResult.nonce)
    }
}
extension String {
    
    func isValidEmail() -> Bool {
        let emailFormat = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format:"SELF MATCHES %@", emailFormat)
        return emailPredicate.evaluate(with: self)

    }
}
