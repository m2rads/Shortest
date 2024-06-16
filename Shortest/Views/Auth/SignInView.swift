//
//  SignInView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-20.
//

import SwiftUI

struct SignInView: View {
    @StateObject var viewModel = SignInViewModel()
    @State private var showMagicLinkView = false

    @Binding var appUser: AppUser?
    
    var body: some View {
        ZStack {
            VStack {
                // Logo
                Spacer()
                Text("Shortest.")
                    .font(.system(size: 50, weight: .bold))
                    .foregroundColor(Color.primary)
                
                Spacer()
                
                VStack {
                    Button {
                        withAnimation {
                            showMagicLinkView.toggle()
                        }
                    } label: {
                        Text("Sign In With Email")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .foregroundColor(.primary)
                            .background(Color(UIColor.systemBackground))
                            .overlay {
                                RoundedRectangle(cornerRadius: 15)
                                    .stroke(Color.primary, lineWidth: 1)
                            }
                    }
                    
                    Button {
                        Task {
                            do {
                                let appUser = try await viewModel.signInWithApple()
                                self.appUser = appUser
                            } catch {
                                print("error sign in with apple")
                            }
                        }
                    } label: {
                        Text("Sign in with Apple")
                            .padding()
                            .foregroundColor(Color(uiColor: .systemBackground))
                            .frame(maxWidth: .infinity)
                            .background {
                                RoundedRectangle(cornerRadius: 15, style: .continuous)
                                    .foregroundColor(Color(uiColor: .label))
                            }
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 50) // Add padding to the bottom of the VStack
            }
            .background(Color(UIColor.systemBackground).edgesIgnoringSafeArea(.all))
            
            if showMagicLinkView {
                MagicLinkView(appUser: $appUser, showMagicLinkView: $showMagicLinkView)
                    .transition(.move(edge: .bottom))
            }
        }
    }
}

#Preview {
    SignInView( appUser: .constant(.init(uid: "1234", email: "hello@example.com", accessToken: "")))
}
