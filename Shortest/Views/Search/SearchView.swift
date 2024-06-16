//
//  SearchView.swift
//  Shortest
//
//  Created by m2rads on 2024-06-15.
//

import SwiftUI

struct SearchView: View {
    @State private var searchText = ""

    var body: some View {
        NavigationView {
            VStack {
                TextField("Search for people or groups", text: $searchText)
                    .padding()
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                List {
                    // Placeholder for search results
                    ForEach(0..<5) { _ in
                        VStack(alignment: .leading) {
                            Text("Some Group")
                                .font(.headline)
                            Text("Description of that group")
                                .font(.subheadline)
                                .foregroundColor(.gray)
                        }
                        .padding(.vertical, 5)
                    }
                }
            }
            .navigationTitle("Search")
        }
    }
}

#Preview {
    SearchView()
}
