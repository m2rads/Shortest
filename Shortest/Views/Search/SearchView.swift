//
//  SearchView.swift
//  Shortest
//
//  Created by m2rads on 2024-06-15.
//

import SwiftUI

struct SearchView: View {
    @State private var searchText = ""
    @State private var searchResults: [SearchResult] = []
    @State private var recommendations: [SearchResult] = []

    var body: some View {
        NavigationView {
            VStack {
                TextField("Search for people or groups", text: $searchText, onCommit: {
                    Task {
                        await performSearch()
                    }
                })
                .padding()
                .textFieldStyle(RoundedBorderTextFieldStyle())

                if searchText.isEmpty {
                    List(recommendations, id: \.id) { result in
                        NavigationLink(destination: destinationView(for: result)) {
                            SearchResultView(result: result)
                        }
                    }
                } else {
                    List(searchResults, id: \.id) { result in
                        NavigationLink(destination: destinationView(for: result)) {
                            SearchResultView(result: result)
                        }
                    }
                }
            }
            .navigationTitle("Search")
            .task {
                await loadRecommendations()
            }
        }
    }

    private func performSearch() async {
        guard !searchText.isEmpty else { return }

        do {
            let response = try await supabase
                .rpc("search", params: ["query": searchText])
                .execute()

            let decodedResults = try JSONDecoder().decode([SearchResponse].self, from: response.data)
            searchResults = parseSearchResults(data: decodedResults)
        } catch {
            print("Error performing search: \(error)")
        }
    }

    private func loadRecommendations() async {
        do {
            let response = try await supabase
                .rpc("recommendations")
                .execute()

            let decodedResults = try JSONDecoder().decode([SearchResponse].self, from: response.data)
            recommendations = parseSearchResults(data: decodedResults)
        } catch {
            print("Error loading recommendations: \(error)")
        }
    }

    private func parseSearchResults(data: [SearchResponse]) -> [SearchResult] {
        var results = [SearchResult]()

        for item in data {
            if item.type == "user" {
                let user = Profile(
                    id: item.id,
                    username: item.username ?? "",
                    fullName: item.full_name ?? "",
                    bio: item.bio,
                    avatarURL: item.avatar_url
                )
                results.append(SearchResult(id: item.id, group: nil, user: user))
            } else if item.type == "group" {
                let group = GroupModel(
                    id: item.id,
                    name: item.name ?? "",
                    description: item.description,
                    creator_id: UUID() // Replace with actual creator ID if available
                )
                results.append(SearchResult(id: item.id, group: group, user: nil))
            }
        }

        return results
    }

    @ViewBuilder
    private func destinationView(for result: SearchResult) -> some View {
        if let group = result.group {
            GroupView(group: group, userId: UUID(), userName: "User Name", userHandle: "UserHandle")  // Replace with real user data
        } else if let user = result.user {
            ProfileView(appUser: .constant(AppUser(uid: user.id.uuidString, email: "test@example.com", accessToken: "token")))  // Replace with real user data
        }
    }
}

#Preview {
    SearchView()
}
