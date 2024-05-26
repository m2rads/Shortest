//
//  RegistrationView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-21.
//

import SwiftUI

struct RegistrationView: View {
    @State private var currentStep = 0
    @State private var email = ""
    @State private var username = ""
    @State private var bio = ""
    @State private var profilePicture = UIImage()
    @Binding var showRegisterView: Bool
    @Binding var appUser: AppUser?
    
    var body: some View {
        VStack {
            switch currentStep {
            case 0:
                EmailView(email: $email, nextStep: nextStep)
            case 1:
                UsernameView(username: $username, nextStep: nextStep, previousStep: previousStep)
            case 2:
                BioView(bio: $bio, nextStep: nextStep, previousStep: previousStep)
            case 3:
                ProfilePictureView(profilePicture: $profilePicture, previousStep: previousStep, finishRegistration: finishRegistration)
            default:
                Text("Unknown step")
            }
        }
        .onAppear {
            if let user = appUser {
                email = user.email ?? ""
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
        if currentStep < 3 {
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
    }
}


#Preview {
    RegistrationView(showRegisterView: .constant(false), appUser: .constant(.init(uid: "", email: "example@hello.com", accessToken: "")))
}
