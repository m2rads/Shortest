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
    
    @State private var showError = false
    
    var body: some View {
        NavigationView {
            VStack {
                TextField("Enter your email", text: $email)
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .foregroundColor(.gray)
                    .cornerRadius(15)
                    .textContentType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .disabled(/*@START_MENU_TOKEN@*/true/*@END_MENU_TOKEN@*/)
                
                if showError {
                    Text("Please enter a valid email address")
                        .foregroundColor(.red)
                }
                
                Button(action: validateAndProceed) {
                    Text("Next")
                        .padding()
                }
            }
            .padding()
        }
    }
    
    func validateAndProceed() {
        if isValidEmail(email) {
            showError = false
            nextStep()
        } else {
            showError = true
        }
    }
    
    func isValidEmail(_ email: String) -> Bool {
        // Simple email validation regex pattern
        let emailRegEx = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format:"SELF MATCHES %@", emailRegEx)
        return emailPredicate.evaluate(with: email)
    }
}

#Preview {
    EmailView(email: .constant("argo.mohrad@gmail.com"), nextStep: {})
}
