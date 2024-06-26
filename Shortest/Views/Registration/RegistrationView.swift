//
//  RegistrationView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-21.
//

import SwiftUI
import Storage

struct RegistrationView: View {
    @State private var currentStep = 0
    @State private var email = ""
    @State private var username = ""
    @State private var fullName = ""
    @State private var bio = ""
    @State private var profilePicture = UIImage()
    @State var isLoading = false

    @Binding var showRegisterView: Bool
    @Binding var appUser: AppUser?
    @Binding var newUserEmail: String?
    @Binding var isRegistered: Bool
    
    var body: some View {
        VStack {
            switch currentStep {
            case 0:
                EmailView(email: $email, nextStep: nextStep)
            case 1:
                FullNameView(fullName: $fullName, nextStep: nextStep, previousStep: previousStep)
            case 2:
                UsernameView(username: $username, nextStep: nextStep, previousStep: previousStep)
            case 3:
                BioView(bio: $bio, nextStep: nextStep, previousStep: previousStep)
            case 4:
                ProfilePictureView(profilePicture: $profilePicture, isLoading: $isLoading, previousStep: previousStep, finishRegistration: finishRegistration)
            default:
                Text("Unknown step")
            }
        }
        .onAppear {
            if let user = newUserEmail {
                email = user
            }
        }
        .gesture(
            DragGesture()
                .onEnded { gesture in
                    if gesture.translation.height > 100 {
                        withAnimation {
                            showRegisterView = false
                        }
                    }
                }
        )
    }
    
    func nextStep() {
        if currentStep < 4 {
            currentStep += 1
        }
    }
    
    func previousStep() {
        if currentStep > 0 {
            currentStep -= 1
        }
    }
    
    func finishRegistration() {
        print("Registration finished with email: \(email), username: \(username), bio: \(bio), profile picture: \(profilePicture)")
        Task {
            isLoading = true
            defer { isLoading = false }
            do {
                let session = try await supabase.auth.session
                
                let imageUrl = try await uploadImage(image: profilePicture)
                
                let updatedProfile = Profile(
                    id: session.user.id,
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
                    .eq("id", value: session.user.id)
                    .execute()
                
                
                appUser = AppUser(
                    uid: session.user.id.uuidString,
                    email: session.user.email,
                    accessToken: session.accessToken
                )
                
                self.showRegisterView = false
            } catch {
                debugPrint(error)
            }
        }
    }
    
    private func uploadImage(image: UIImage) async throws -> String? {
        guard let data = image.jpegData(compressionQuality: 0.8) else { return nil }
        
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
    RegistrationView(showRegisterView: .constant(false), appUser: .constant(.init(uid: "12345", email: "hello@example.com", accessToken: "")), newUserEmail: .constant("example@hello.com"), isRegistered: .constant(false))
}
