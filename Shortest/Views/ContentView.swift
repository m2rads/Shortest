//
//  ContentView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-17.
//

import SwiftUI

struct ContentView: View {
    @State private var showRegisterView = false
    @State var appUser: AppUser?
    @StateObject var viewModel = SignInViewModel()
    @State var result: Result<Void, Error>?
    @State private var isRegistered = false
    @State var newUserEmail: String?
    
    var body: some View {
        NavigationView {
            ZStack {
                if appUser != nil {
                    ProfileView(appUser: $appUser)
                } else {
                    SignInView(appUser: $appUser)
                }
            }
            .onAppear {
                Task {
                    try await AuthManager.shared.getCurrentSession()
                }
            }
            .fullScreenCover(isPresented: $showRegisterView) {
                RegistrationView(showRegisterView: $showRegisterView, appUser: $appUser, newUserEmail: $newUserEmail, isRegistered: $isRegistered)
            }
            .onOpenURL(perform: { url in
                Task {
                    do {
                        print("url \(url)")
                        if let (accessToken, refreshToken) = extractTokens(from: url) {
                            let newUserEmail = try await AuthManager.shared.setInviteSession(accessToken: accessToken, refreshToken: refreshToken)
                            self.newUserEmail = newUserEmail
                            showRegisterView.toggle()
                            print("deeplink result: \(String(describing: appUser))")
                        } else {
                            print("Invalid URL or missing tokens")
                        }
                        print("deeplink result: \(String(describing: appUser))")
                    } catch {
                        print("deeplink error: \(error)")
                        self.result = .failure(error)
                    }
                }
            })
        }
    }
    
    private func extractTokens(from url: URL) -> (accessToken: String, refreshToken: String)? {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let fragment = components.fragment else {
            return nil
        }
        
        let params = fragment.split(separator: "&").reduce(into: [String: String]()) { result, param in
            let splitParam = param.split(separator: "=")
            if splitParam.count == 2 {
                result[String(splitParam[0])] = String(splitParam[1])
            }
        }
        
        if let accessToken = params["access_token"], let refreshToken = params["refresh_token"] {
            return (accessToken, refreshToken)
        }
        
        return nil
    }
}

#Preview {
    ContentView(appUser: nil)
}
