//
//  Profile.swift
//  Shortest
//
//  Created by m2rads on 2024-05-18.
//

import SwiftUI
import Supabase

struct Profile: View {
    @State var username = ""
    @State var fullname = ""
    @State var website = ""
    
    @State var isLoading = false
    
    var body: some View {
        Section {
            TextField("Username", text: $username)
                .textContentType(.username)
                .textInputAutocapitalization(.never)
            TextField("Full Name", text: $fullname)
                .textContentType(.name)
            TextField("Website", text: $website)
                .textContentType(.URL)
                .textInputAutocapitalization(.never)
        }
        
        Section {
            Button("Update profile") {
                updateProfileButtonTapped() // TODO: implement
            }
            
        }
    }
    
    func updateProfileButtonTapped() {
        Task {
            isLoading = true
            defer { isLoading = false }
            do {
                let currentUser = try await supabase.auth.session.user
                
                try await supabase.database
                    .from("profiles")
                    .update(
                        UpdateProfileParams(
                            username: username,
                            fullName: fullname,
                            website: website
                        )
                    )
                    .eq("id", value: currentUser.id)
                    .execute()
            } catch {
                debugPrint(error)
            }
        }
    }
}

#Preview {
    Profile()
}
