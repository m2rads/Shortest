//
//  ChatView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-20.
//

import SwiftUI

struct ChatView: View {
    @Binding var appUser: AppUser?
    
    var body: some View {
        if let appUser = appUser {
            VStack {
                Text(appUser.uid)
                
                Text(appUser.email ?? "no email")
                
                Button {
                    Task {
                        do {
                            try await AuthManager.shared.signOut()
                            self.appUser = nil
                        } catch {
                            print("unable to sign out at this time")
                        }
                    }
                } label: {
                    Text("Sign out")
                        .foregroundStyle(.red)
                }
            }
        }
    }
}

#Preview {
    ChatView(appUser: .constant(.init(uid: "12345", email: "hello@example.com")))
}
