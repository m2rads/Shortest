//
//  Login.swift
//  Shortest
//
//  Created by m2rads on 2024-05-18.
//

import SwiftUI
import Supabase

struct MagicLinkView: View {
    @Binding var showMagicLinkView: Bool
    @State var email = ""
    @State var isLoading = false
    @State var result: Result<Void, Error>?
    
    var body: some View {
        NavigationView {
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
                // Optional binding in Swift / we check if the result var has value
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
            // Event handling when the user clicks on the email in their app: deep linking auth
            .onOpenURL(perform: { url in
                Task {
                    do {
                        try await supabase.auth.session(from: url)
                    } catch {
                        self.result = .failure(error)
                    }
                }
            })
            .navigationBarTitle("Sign In with Email", displayMode: .inline)
            .navigationBarItems(leading: Button(action: {
                withAnimation {
                    showMagicLinkView = false
                }
            }) {
                Image(systemName: "chevron.left")
                    .foregroundColor(Color.primary)
            })
            .gesture(
                DragGesture()
                    .onEnded { gesture in
                        if gesture.translation.height > 100 {
                            withAnimation {
                                showMagicLinkView = false
                            }
                        }
                    }
            )
        }
    }
    
    func signInButtonTapped() {
        Task {
            isLoading = true
            defer { isLoading = false }
            
            do {
                try await supabase.auth.signInWithOTP(
                    email: email,
                    redirectTo: URL(string: "app.shortest://")
                )
                result = .success(())
            } catch {
                result = .failure(error)
            }
        }
    }
}

#Preview {
    MagicLinkView(showMagicLinkView: .constant(false))
}
