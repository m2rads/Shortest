//
//  ContentView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-17.
//

import SwiftUI

struct ContentView: View {
    @State var isAuthenticated = false

    var body: some View {
        Group {
          if isAuthenticated {
            ProfileView()
          } else {
              MagicLinkView()
          }
        }
        .task {
          for await state in await supabase.auth.authStateChanges {
            if [.initialSession, .signedIn, .signedOut].contains(state.event) {
              isAuthenticated = state.session != nil
            }
          }
        }
    }
}

#Preview {
    ContentView()
}
