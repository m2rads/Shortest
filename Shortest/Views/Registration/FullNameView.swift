//
//  FullNameView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-26.
//

import SwiftUI

struct FullNameView: View {
    @Binding var fullName: String
    var nextStep: () -> Void
    var previousStep: () -> Void
    
    var body: some View {
        VStack {
            TextField("Enter your full name", text: $fullName)
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
    FullNameView(fullName: .constant("Mohammad"), nextStep: {}, previousStep: {})
}
