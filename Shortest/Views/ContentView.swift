//
//  ContentView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-17.
//

import SwiftUI

struct ContentView: View {
    @State var appUser: AppUser?
    
    var body: some View {
        ZStack {
            if appUser != nil {
                ChatView(appUser: $appUser)
            } else {
                SignInView(appUser: $appUser)
            }
        }
        .onAppear {
            Task {
                try await AuthManager.shared.getCurrentSession()
            }
        }
    }
}

#Preview {
    ContentView(appUser: nil)
}
