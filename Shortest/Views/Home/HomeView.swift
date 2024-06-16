//
//  HomeView.swift
//  Shortest
//
//  Created by m2rads on 2024-06-15.
//

import SwiftUI

struct HomeView: View {
    @Binding var appUser: AppUser?
    @State private var messages: [Message] = []

    var body: some View {
        NavigationView {
            List(messages) { message in
                VStack(alignment: .leading) {
                    HStack {
                        Text(message.userName)
                            .font(.headline)
                        Text("@\(message.userHandle)")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                        Spacer()
                        Text(message.groupName)
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    Text(message.content)
                        .font(.body)
                }
                .padding(.vertical, 5)
            }
            .navigationTitle("Shortest.")
            .onAppear {
                loadMessages()
            }
        }
    }

    private func loadMessages() {
        // Fetch messages from Supabase and assign to `messages`
        // This is a placeholder for the actual fetching logic
        messages = [
            Message(id: UUID(), content: "simply dummy text of the printing and typesetting industry.", group_id: UUID(), user_id: UUID(), timestamp: Date(), userName: "Mohammad", userHandle: "Mohd23", groupName: "Group Name"),
            Message(id: UUID(), content: "simply dummy text of the printing and typesetting industry. new text", group_id: UUID(), user_id: UUID(), timestamp: Date(), userName: "Someone", userHandle: "Someone12", groupName: "Group Name")
        ]
    }
}

#Preview {
    HomeView(appUser: .constant(.init(uid: "12345", email: "hello@example.com", accessToken: "")))
}
