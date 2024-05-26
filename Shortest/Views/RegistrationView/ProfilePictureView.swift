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
    
    @State private var isShowingImagePicker = false
    
    var body: some View {
        VStack {
            Text("Choose your profile picture")
                .padding(.bottom, 20)
            if profilePicture != UIImage() {
                Image(uiImage: profilePicture)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: 100, height: 100)
                    .clipShape(Circle())
                    .overlay(Circle().stroke(Color.white, lineWidth: 2))
                    .shadow(radius: 10)
                    .padding()
                    .onTapGesture {
                        isShowingImagePicker = true
                    }
            } else {
                Image("ppfPlaceHolder")
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: 100, height: 100)
                    .clipShape(Circle())
                    .overlay(Circle().stroke(Color.white, lineWidth: 2))
                    .shadow(radius: 10)
                    .padding()
                    .onTapGesture {
                        isShowingImagePicker = true
                    }
            }
            
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
        .sheet(isPresented: $isShowingImagePicker) {
            ImagePicker(profilePicture: $profilePicture)
        }
    }
}

#Preview {
    ProfilePictureView(profilePicture: .constant(UIImage()), previousStep: {}, finishRegistration: {})
}
