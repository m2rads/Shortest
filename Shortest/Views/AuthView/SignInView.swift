//
//  SignInView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-20.
//

import SwiftUI

struct SignInView: View {
    @StateObject var viewModel = SignInViewModel()
    
    @Binding var appUser: AppUser?
    
    var body: some View {
        VStack {
            Button {
                Task {
                    do {
                        let appUser = try await viewModel.SignInWithApple()
                        self.appUser = appUser
                    } catch {
                        print("error sign in with apple")
                    }
                }
            } label: {
                Text("Sign in with Apple")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .foregroundColor(.primary)
                    .background(Color(UIColor.systemBackground))
                    .overlay {
                        RoundedRectangle(cornerRadius: 15)
                            .stroke(Color.primary, lineWidth: 1)
                    }
            }
            .padding(.horizontal, 24)
        }
        .background(Color(UIColor.systemBackground).edgesIgnoringSafeArea(.all))
    }
}

#Preview {
    SignInView( appUser: .constant(.init(uid: "1234", email: "hello@example.com")))
}
