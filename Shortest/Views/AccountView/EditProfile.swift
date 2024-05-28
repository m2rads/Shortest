//
//  Profile.swift
//  Shortest
//
//  Created by m2rads on 2024-05-18.
//

import SwiftUI
import PhotosUI
import Storage

struct EditProfile: View {
    @State var username = ""
    @State var fullName = ""
    @State var bio = ""
    @State var isLoading = false
    
    @State var imageSelection: PhotosPickerItem?
    @State var avatarImage: AvatarImage?
    
    @Binding var appUser: AppUser?
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    HStack {
                        Group {
                            if let avatarImage {
                                avatarImage.image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            } else {
                                Color.clear
                            }
                        }
                        .frame(width: 80, height: 80)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(Color.white, lineWidth: 4))
                        
                        Spacer()
                        
                        PhotosPicker(selection: $imageSelection, matching: .images) {
                            Image(systemName: "pencil.circle.fill")
                                .symbolRenderingMode(.multicolor)
                                .font(.system(size: 30))
                                .foregroundColor(.accentColor)
                        }
                    }
                }
                
                Section {
                    TextField("Username", text: $username)
                        .textContentType(.username)
                        .foregroundColor(.gray)
                        .disabled(/*@START_MENU_TOKEN@*/true/*@END_MENU_TOKEN@*/)
                        .textInputAutocapitalization(.never)
                    TextField("Full name", text: $fullName)
                        .textContentType(.name)
                    TextField("Bio", text: $bio)
                        .textContentType(.URL)
                        .textInputAutocapitalization(.never)
                }
                
                Section {
                    Button("Update profile") {
                        updateProfileButtonTapped()
                    }
                    .bold()
                    
                    if isLoading {
                        ProgressView()
                    }
                }
            }
            .navigationTitle("Edit Profile")
            .onChange(of: imageSelection) { _, newValue in
                guard let newValue else { return }
                loadTransferable(from: newValue)
            }
        }
        .task {
            await getInitialProfile()
        }
    }
    
    func getInitialProfile() async {
        do {
            let currentUser = try await supabase.auth.session.user
            
            let profile: Profile = try await supabase
                .from("profiles")
                .select()
                .eq("id", value: currentUser.id)
                .single()
                .execute()
                .value
            
            username = profile.username ?? ""
            fullName = profile.fullName ?? ""
            bio = profile.bio ?? ""
            
            if let avatarURL = profile.avatarURL, !avatarURL.isEmpty {
                try await downloadImage(path: avatarURL)
            }
            
        } catch {
            debugPrint(error)
        }
    }
    
    func updateProfileButtonTapped() {
        Task {
            isLoading = true
            defer { isLoading = false }
            do {
                let currentUser = try await supabase.auth.session.user
                
                let imageUrl = try await uploadImage()
                
                let updatedProfile = Profile(
                    username: username,
                    fullName: fullName,
                    bio: bio,
                    avatarURL: imageUrl
                )
                
                try await supabase
                    .from("profiles")
                    .update(
                        updatedProfile
                    )
                    .eq("id", value: currentUser.id)
                    .execute()
            } catch {
                debugPrint(error)
            }
        }
    }
    
    private func loadTransferable(from imageSelection: PhotosPickerItem) {
        Task {
            do {
                avatarImage = try await imageSelection.loadTransferable(type: AvatarImage.self)
            } catch {
                debugPrint(error)
            }
        }
    }
    
    private func downloadImage(path: String) async throws {
        let data = try await supabase.storage.from("avatars").download(path: path)
        avatarImage = AvatarImage(data: data)
    }
    
    private func uploadImage() async throws -> String? {
        guard let data = avatarImage?.data else { return nil }
        
        let filePath = "\(UUID().uuidString).jpeg"
        
        try await supabase.storage
            .from("avatars")
            .upload(
                path: filePath,
                file: data,
                options: FileOptions(contentType: "image/jpeg")
            )
        
        return filePath
    }
}

#Preview {
    EditProfile(appUser: .constant(.init(uid: "12345", email: "hello@example.com", accessToken: "")))
}
