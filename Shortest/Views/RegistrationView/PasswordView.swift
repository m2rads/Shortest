//
//  PasswordView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-21.
//

import SwiftUI

struct PasswordView: View {
    @Binding var password: String
    var nextStep: () -> Void
    var previousStep: () -> Void
    
    var body: some View {
        VStack {
            SecureField("Enter your password", text: $password)
                .padding()
                .textFieldStyle(RoundedBorderTextFieldStyle())
            
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
    PasswordView(password: .constant(""), nextStep: {}, previousStep: {})
}
