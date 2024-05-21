//
//  ProfilePictureView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-21.
//

import SwiftUI

struct ProfilePictureView: View {
    @Binding var profilePicture: UIImage
    var previousStep: () -> Void
    var finishRegistration: () -> Void
    
    var body: some View {
        VStack {
            // Placeholder for profile picture selection
            Text("Profile Picture View")
            
            HStack {
                Button(action: previousStep) {
                    Text("Back")
                        .padding()
                }
                
                Button(action: finishRegistration) {
                    Text("Finish")
                        .padding()
                }
            }
        }
        .padding()
    }
}

#Preview {
    ProfilePictureView(profilePicture: .constant(UIImage()), previousStep: {}, finishRegistration: {})
}
