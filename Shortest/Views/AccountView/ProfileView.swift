//  ProfileView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-21.
//

import SwiftUI
import PhotosUI
import Storage

struct ProfileView: View {
    @State private var showInviteView = false
    @Binding var appUser: AppUser?
    @Environment(\.colorScheme) var colorScheme
    
    @State var username = ""
    @State var fullName = ""
    @State var bio = ""
    
    @State var imageSelection: PhotosPickerItem?
    @State var avatarImage: AvatarImage?
    @State var isLoading = false
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading) {
                    // Profile picture and info
                    HStack(alignment: .top) {
                        Group {
                            if let avatarImage {
                                avatarImage.image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            } else {
                                Image("ppfPlaceHolder")
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            }
                        }
                        .frame(width: 80, height: 80)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(Color.white, lineWidth: 4))
                        .padding(.leading)
                        
                        VStack(alignment: .leading) {
                            Text("@\(username)")
                                .font(.subheadline)
                                .foregroundColor(.gray)
                            
                            Text(fullName)
                                .font(.title2)
                                .bold()
                        }
                        .padding(.leading)
                        Spacer()
                    }
                    .padding(.top, 20)
                    .padding(.bottom, 20)
                    
                    // Bio and website
                    VStack(alignment: .leading) {
                        Text(bio)
                            .font(.body)
                            .padding(.bottom, 5)
                        
                        HStack {
                            HStack {
                                Text("4")
                                    .bold()
                                Text("groups")
                                Text("1")
                                    .bold()
                                Text("members")
                            }
                            .font(.footnote)
                            .foregroundColor(.gray)
                            .padding(.top, 5)
                            
                            Spacer()
                            
                            Button(action: {
                                showInviteView.toggle()
                            }, label: {
                                Image(systemName: "gift.circle.fill")
                                    .foregroundColor(.gray)
                            })
                            .padding(.bottom, -6)
                            .fullScreenCover(isPresented: $showInviteView) {
                                InviteView(showInviteView: $showInviteView, appUser: $appUser)
                            }
                        }
                    }
                    .padding(.horizontal)
                    
                    // Empty state for messages
                    VStack {
                        Text("No thoughts yet")
                            .font(.body)
                            .foregroundColor(.gray)
                            .padding()
                        Spacer()
                    }
                }
                .padding(.top, 20)
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: {
                        // Action for going back
                    }) {
                        Image(systemName: "chevron.left")
                            .foregroundColor(.gray)
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        NavigationLink(destination: EditProfile(appUser: $appUser)) {
                            Text("Edit Profile")
                        }
                        Button(action: {
                            Task {
                                do {
                                    try await AuthManager.shared.signOut()
                                    self.appUser = nil
                                } catch {
                                    print("unable to sign out at this time")
                                }
                            }
                        }) {
                            Text("Sign Out")
                        }
                    } label: {
                        Image(systemName: "ellipsis")
                            .foregroundColor(.gray)
                    }
                }
            }
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

struct AvatarImage: Transferable {
    let data: Data
    var image: Image {
        Image(uiImage: UIImage(data: data)!)
    }
    
    static var transferRepresentation: some TransferRepresentation {
        DataRepresentation(importedContentType: .image) { data in
            guard UIImage(data: data) != nil else {
                throw NSError(domain: "Invalid image data", code: -1, userInfo: nil)
            }
            return AvatarImage(data: data)
        }
    }
}

#Preview {
    ProfileView(appUser: .constant(.init(uid: "12345", email: "hello@example.com", accessToken: "")))
}
