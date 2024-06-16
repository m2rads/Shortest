//
//  GroupView.swift
//  Shortest
//
//  Created by m2rads on 2024-06-14.
//

import SwiftUI

struct GroupView: View {
    @State private var showJoinConfirmation = false
    @State var group: GroupModel
    @State var isMember = false
    @State var isOwner = false
    @State private var messageText = ""
    @State private var messages: [Message] = []
    var userId: UUID
    var userName: String
    var userHandle: String

    var body: some View {
        VStack {
            ScrollView {
                VStack(alignment: .leading) {
                    ForEach(messages) { message in
                        HStack {
                            VStack(alignment: .leading) {
                                Text("\(message.userName) @\(message.userHandle)")
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                                Text(message.content)
                                    .padding()
                                    .background(Color.gray.opacity(0.2))
                                    .cornerRadius(8)
                            }
                            .padding(.horizontal)
                            .padding(.top, 4)
                        }
                    }
                }
            }
            
            if isOwner || isMember {
                HStack {
                    TextField("Enter your message...", text: $messageText)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .frame(minHeight: 30)
                    
                    Button(action: {
                        Task {
                            await sendMessage()
                        }
                    }) {
                        Image(systemName: "paperplane.fill")
                            .foregroundColor(.blue)
                            .padding()
                    }
                }
                .padding()
            } else {
                Button(action: {
                    showJoinConfirmation.toggle()
                }) {
                    Text("Join")
                        .padding()
                        .foregroundColor(Color(uiColor: .systemBackground))
                        .frame(maxWidth: .infinity)
                        .background {
                            RoundedRectangle(cornerRadius: 15, style: .continuous)
                                .foregroundColor(Color(uiColor: .label))
                        }
                }
                .padding()
                .alert(isPresented: $showJoinConfirmation) {
                    Alert(
                        title: Text("Join Group"),
                        message: Text("Are you sure you want to join this group?"),
                        primaryButton: .default(Text("Join")) {
                            Task {
                                await joinGroup()
                            }
                        },
                        secondaryButton: .cancel()
                    )
                }
            }
        }
        .navigationTitle(group.name)
        .task {
            await checkMembership()
            await checkOwnership()
            await loadMessages()
        }
    }
    
    private func sendMessage() async {
        guard !messageText.isEmpty else { return }
        
        let newMessage = Message(
            id: UUID(),
            content: messageText,
            group_id: group.id,
            user_id: userId,
            timestamp: Date(),
            userName: userName,
            userHandle: userHandle,
            groupName: group.name
        )
        
        messages.append(newMessage)
        messageText = ""
        saveMessage(newMessage)
    }
    
    private func saveMessage(_ message: Message) {
        Task {
            do {
                try await supabase
                    .from("messages")
                    .insert(message)
                    .single()
                    .execute()
            } catch {
                print("Error saving message: \(error)")
            }
        }
    }

    private func loadMessages() async {
        do {
            let fetchedMessages: [Message] = try await supabase
                .from("messages")
                .select()
                .eq("group_id", value: group.id)
                .execute()
                .value
            
            messages = fetchedMessages
        } catch {
            print("Error loading messages: \(error)")
        }
    }

    private func joinGroup() async {
        do {
            let userId = try await supabase.auth.session.user.id
            let groupMembership = GroupMembership(id: UUID(), group_id: group.id, user_id: userId, joined_at: Date())
            try await supabase
                .from("group_memberships")
                .insert(groupMembership)
                .single()
                .execute()
                .value
            
            isMember = true
        } catch {
            print("Error joining group: \(error)")
        }
    }

    private func checkMembership() async {
        do {
            let userId = try await supabase.auth.session.user.id
            let memberships: [GroupMembership] = try await supabase
                .from("group_memberships")
                .select()
                .eq("group_id", value: group.id)
                .eq("user_id", value: userId)
                .execute()
                .value

            isMember = !memberships.isEmpty
        } catch {
            print("Error checking membership: \(error)")
        }
    }

    private func checkOwnership() async {
        do {
            let userId = try await supabase.auth.session.user.id
            isOwner = group.creator_id == userId
        } catch {
            print("Error checking ownership: \(error)")
        }
    }
}

#Preview {
    GroupView(
        group: GroupModel(id: UUID(), name: "A New Group", description: "This is a new group to test", creator_id: UUID()),
        userId: UUID(),
        userName: "Mohammad",
        userHandle: "Mohrad23"
    )
}

