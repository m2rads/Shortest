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
    
    var body: some View {
        VStack {
            Text(group.name)
                .font(.title)
                .bold()
                .padding()
            
            Text(group.description ?? "")
                .font(.body)
                .padding([.leading, .trailing])
            
            Spacer()
            
            if isMember {
                Button(action: {
                    // Action to add a new post
                }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.largeTitle)
                        .foregroundColor(.blue)
                }
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
        .padding()
        .navigationTitle(group.name)
        .task {
            await checkMembership()
        }
    }
    
    private func joinGroup() async {
        do {
            let userId = try await supabase.auth.session.user.id
            let groupMembership = GroupMembership(id: UUID(), groupId: group.id ?? UUID(), userId: userId, joinedAt: Date())
            let membership: GroupMembership = try await supabase
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
}

struct GroupMembership: Codable {
    let id: UUID
    let groupId: UUID
    let userId: UUID
    let joinedAt: Date
}


#Preview {
    GroupView(group: .init(id: UUID(), name: "Test Group", description: "Testing the first Group", creatorId: UUID()))
}

