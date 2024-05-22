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
            VStack(spacing: 20) {
                // Email Text Field
                TextField("Email", text: $email)
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(15)
                    .textContentType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()

                // Sign In Button
                Button(action: {
                    signInButtonTapped()
                }) {
                    Text("Sign in")
                        .padding()
                        .foregroundColor(Color(uiColor: .systemBackground))
                        .frame(maxWidth: .infinity)
                        .background {
                            RoundedRectangle(cornerRadius: 15, style: .continuous)
                                .foregroundColor(Color(uiColor: .label))
                        }
                }

                // Loading Indicator
                if isLoading {
                    ProgressView()
                }
                
                // Result Message
                if let result {
                    switch result {
                    case .success:
                        Text("Check your inbox")
                            .foregroundColor(.green)
                    case .failure(let error):
                        Text(error.localizedDescription)
                            .foregroundColor(.red)
                    }
                }
                Spacer()
            }
            .padding(.top, 50)
            .padding()
            .background(Color(.systemBackground).edgesIgnoringSafeArea(.all))
            .navigationBarTitle("Magic Link Sign In", displayMode: .inline)
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
