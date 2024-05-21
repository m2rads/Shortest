//
//  SignInView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-20.
//

import SwiftUI

class SignInViewModel: ObservableObject {
    
    func SignInWithApple(){}
}

struct SignInView: View {
    @StateObject var viewModel = SignInViewModel()
    let appleSignIn = AppleSignIn()
    
    var body: some View {
        Button {
            appleSignIn.startSignInWithAppleFlow { result in
                switch result {
                    case .success(let appleSignInResult):
                        Task {
                            try await AuthManager.shared.signInWithApple(idToken: appleSignInResult.idToken, nonce: appleSignInResult.nonce)
                        }
                case .failure(let failure):
                    print("error \(failure)")
                }
            }
        } label: {
            Text("Sign in with Apple")
                .foregroundStyle(.black)
        }
    }
}

#Preview {
    SignInView()
}
