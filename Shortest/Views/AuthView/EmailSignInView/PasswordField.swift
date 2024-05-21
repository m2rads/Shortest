//
//  PasswordField.swift
//  Shortest
//
//  Created by m2rads on 2024-05-20.
//

import SwiftUI

struct PasswordField: View {
    var placeHolder: String
    @Binding var text: String
    
    var body: some View {
        SecureField(placeHolder, text: $text)
            .padding()
            .overlay {
                RoundedRectangle(cornerRadius: 15)
                    .stroke(Color.primary, lineWidth: 1)
            }
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
    }
}

#Preview {
    PasswordField(placeHolder: "Password", text: .constant(""))
}
