//
//  Login.swift
//  Shortest
//
//  Created by m2rads on 2024-05-18.
//

import SwiftUI
import Supabase

struct AuthView: View {
    @State var email = ""
    @State var isLoading = false
    @State var result: Result<Void, Error>?
    
    var body: some View {
        Form {
            Section {
                TextField("Email", text: $email)
                    .textContentType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
            }
            Section {
                Button("Sign in") {
                    signInButtonTapped()
                }
            }
        }
    }
    
    func signInButtonTapped() {
        // async code in a new task: here probably making a http request to supabase
        Task {
            isLoading = true
            defer { isLoading = false }
            
            do {
                try await supabase.auth.signInWithOTP(
                    email: email,
                    redirectTo: URL(string: "io.supabase.user-management://login-callback")
                )
            }
        }
    }
}

#Preview {
    AuthView()
}
