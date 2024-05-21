//
//  EmailView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-21.
//

import SwiftUI

struct EmailView: View {
    @Binding var email: String
    var nextStep: () -> Void
    
    var body: some View {
        VStack {
            TextField("Enter your email", text: $email)
                .padding()
                .textFieldStyle(RoundedBorderTextFieldStyle())
            
            Button(action: nextStep) {
                Text("Next")
                    .padding()
            }
        }
        .padding()
    }
}

#Preview {
    EmailView(email: .constant(""), nextStep: {})
}
