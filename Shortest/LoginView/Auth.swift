//
//  Login.swift
//  Shortest
//
//  Created by m2rads on 2024-05-18.
//

import SwiftUI
import Supabase

struct Auth: View {
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
                .foregroundColor(.black)
                
                if isLoading {
                    ProgressView()
                }
            }
            // optional binding in swift / we check if the result var has value
            if let result {
                Section {
                    switch result {
                    case .success:
                        Text("Check your inbox")
                    case .failure(let error):
                        Text(error.localizedDescription).foregroundStyle(.red)
                    }
                }
            }
        }
        // event handling when the user click on the email in their app : deep linking auth
        .onOpenURL(perform: { url in
            Task {
                do {
                    try await supabase.auth.session(from: url)
                } catch {
                    self.result = .failure(error)
                }
            }
        })
    }
    
    func signInButtonTapped() {
        // async code in a new task: here probably making a http request to supabase
        Task {
            isLoading = true
            defer { isLoading = false }
            
            do {
                try await supabase.auth.signInWithOTP(
                    email: email,
                    redirectTo: URL(string: "com.shortest://login-callback")
                )
                result = .success(())
            } catch {
                result = .failure(error)
            }
        }
    }
}

#Preview {
    Auth()
}
