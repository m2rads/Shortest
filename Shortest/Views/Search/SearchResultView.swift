//
//  SearchResultView.swift
//  Shortest
//
//  Created by m2rads on 2024-06-16.
//

import SwiftUI

struct SearchResultView: View {
    let result: SearchResult
    
    var body: some View {
        VStack(alignment: .leading) {
            if let group = result.group {
                Text(group.name)
                    .font(.headline)
                Text(group.description ?? "")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            } else if let user = result.user {
                Text(user.fullName ?? "no name")
                    .font(.headline)
                Text("@\(String(describing: user.username))")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
        }
        .padding(.vertical, 5)
    }
}

#Preview {
    VStack {
        SearchResultView(result: SearchResult(
            id: UUID(), group: GroupModel(id: UUID(), name: "Test Group", description: "A test group for preview", creator_id: UUID()),
            user: nil
        ))
        
        SearchResultView(result: SearchResult(
            id: UUID(), group: nil,
            user: Profile(id: UUID(), username: "testuser", fullName: "Test User", bio: "This is a test user", avatarURL: nil)
        ))
    }
}
