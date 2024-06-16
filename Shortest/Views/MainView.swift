//
//  MainView.swift
//  Shortest
//
//  Created by m2rads on 2024-06-15.
//

import SwiftUI

struct MainView: View {
    @Binding var appUser: AppUser?

    var body: some View {
        TabView {
            HomeView(appUser: $appUser)
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Home")
                }

            SearchView()
                .tabItem {
                    Image(systemName: "magnifyingglass")
                    Text("Search")
                }

            NotificationView()
                .tabItem {
                    Image(systemName: "bell.fill")
                    Text("Notifications")
                }

            ProfileView(appUser: $appUser)
                .tabItem {
                    Image(systemName: "person.fill")
                    Text("Profile")
                }
        }
    }
}

#Preview {
    MainView(appUser: .constant(.init(uid: "12345", email: "hello@example.com", accessToken: "")))
}
