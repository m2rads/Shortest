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
        SignInView()
    }
}

#Preview {
    ContentView()
}
