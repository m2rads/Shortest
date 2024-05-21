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
    
    func SignInWithApple() async throws -> AppUser {
        let appleResult =  try await appleSignIn.startSignInWithAppleFlow()
        return try await AuthManager.shared.signInWithApple(idToken: appleResult.idToken, nonce: appleResult.nonce)
    }
}
