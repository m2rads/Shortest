//
//  UsernameView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-21.
//

import SwiftUI

struct UsernameView: View {
    @Binding var username: String
    var nextStep: () -> Void
    var previousStep: () -> Void
    
    var body: some View {
        VStack {
            TextField("Enter your username", text: $username)
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
    UsernameView(username: .constant("Mohrad23"), nextStep: {}, previousStep: {})
}
