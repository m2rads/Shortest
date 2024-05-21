//
//  ChatView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-20.
//

import SwiftUI

struct ChatView: View {
    @State var appUser: AppUser
    
    var body: some View {
        VStack {
            Text(appUser.uid)
            
            Text(appUser.email ?? "no email")
            
            Button {
                Task {
                    do {
                        try await AuthManager.shared.signOut()
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

#Preview {
    ChatView(appUser: .init(uid: "12345", email: "hello@example.com"))
}
