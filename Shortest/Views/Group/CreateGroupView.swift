//
//  CreateGroup.swift
//  Shortest
//
//  Created by m2rads on 2024-06-12.
//

import SwiftUI

struct CreateGroupView: View {
    @State private var groupName = ""
    @State private var description = ""
    @Binding var showCreateGroupView: Bool

    var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("Group Info")) {
                    TextField("Group name", text: $groupName)
                    TextField("Description", text: $description)
                }

                Button("Create") {
                    Task {
                        await createGroup()
                    }
                }
            }
            .navigationTitle("Create New Group")
            .navigationBarItems(leading: Button("Cancel") {
                showCreateGroupView = false
            })
        }
    }

    private func createGroup() async {
        do {
            let currentUser = try await supabase.auth.session.user
            let group = GroupModel(
                id: UUID(),
                name: groupName,
                description: description,
                creator_id: currentUser.id
            )
            
            try await supabase
                .from("groups")
                .insert(group)
                .single()
                .execute()
                .value

            showCreateGroupView = false
        } catch {
            print("Error creating group: \(error)")
        }
    }
}

#Preview {
    CreateGroupView(showCreateGroupView: .constant(false))
}
