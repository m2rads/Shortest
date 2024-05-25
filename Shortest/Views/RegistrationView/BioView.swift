//
//  PasswordView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-21.
//

import SwiftUI

struct BioView: View {
    @Binding var bio: String
    var nextStep: () -> Void
    var previousStep: () -> Void
    
    var body: some View {
        VStack {
            SecureField("Enter your password", text: $bio)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(15)
                .textContentType(.emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
            
            HStack {
                Button(action: previousStep) {
                    Text("Back")
                        .padding()
                }
                
                Button(action: nextStep) {
                    Text("Next")
                        .padding()
                }
            }
        }
        .padding()
    }
}


#Preview {
    BioView(bio: .constant(""), nextStep: {}, previousStep: {})
}
