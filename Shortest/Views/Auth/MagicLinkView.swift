//
//  Login.swift
//  Shortest
//
//  Created by m2rads on 2024-05-18.
//

import SwiftUI
import Supabase

struct MagicLinkView: View {
    @StateObject var viewModel = SignInViewModel()
    @State var email = ""
    @State var isLoading = false
    @State var result: Result<Void, Error>?
    
    @Binding var appUser: AppUser?
    @Binding var showMagicLinkView: Bool
    
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
            .onOpenURL(perform: { url in
                Task {
                    do {
                        let appUser = try await viewModel.getCurrentSessionFromUrl(Url: url)
                        self.appUser = appUser
                    } catch {
                        self.result = .failure(error)
                    }
                }
            })
        }
    }
    
    func signInButtonTapped() {
        Task {
            isLoading = true
            defer { isLoading = false }
            
            do {
                try await viewModel.signInWithMagicLink(email: email)
                result = .success(())
            } catch {
                result = .failure(error)
            }
        }
    }
}

#Preview {
    MagicLinkView(appUser: .constant(.init(uid: "1234", email: "hello@example.com", accessToken: "")), showMagicLinkView: .constant(false))
}
