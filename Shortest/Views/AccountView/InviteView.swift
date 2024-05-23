//  InviteView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-22.
//

import SwiftUI

struct InviteView: View {
    @Binding var showInviteView: Bool
    @Binding var appUser: AppUser?

    @State var email = ""
    @State var isLoading = false
    @State var result: Result<Void, Error>?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Email Text Field
                TextField("Email", text: $email)
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(15)
                    .textContentType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                
                // Invite Button
                Button(action: {
                    inviteUser()
                }) {
                    Text("Invite")
                        .padding()
                        .foregroundColor(Color(uiColor: .systemBackground))
                        .frame(maxWidth: .infinity)
                        .background {
                            RoundedRectangle(cornerRadius: 15, style: .continuous)
                                .foregroundColor(Color(uiColor: .label))
                        }
                }
                
                // Loading Indicator
                if isLoading {
                    ProgressView()
                }
                
                // Result Message
                if let result {
                    switch result {
                    case .success:
                        Text("Check your inbox")
                            .foregroundColor(.green)
                    case .failure(let error):
                        Text(error.localizedDescription)
                            .foregroundColor(.red)
                    }
                }
                Spacer()
            }
            .padding(.top, 50)
            .padding()
            .background(Color(.systemBackground).edgesIgnoringSafeArea(.all))
            .navigationBarTitle("Invite a friend", displayMode: .inline)
            .navigationBarItems(leading: Button(action: {
                withAnimation {
                    showInviteView = false
                }
            }) {
                Image(systemName: "chevron.down")
                    .foregroundColor(Color.primary)
            })
            .gesture(
                DragGesture()
                    .onEnded { gesture in
                        if gesture.translation.height > 100 {
                            withAnimation {
                                showInviteView = false
                            }
                        }
                    }
            )
        }
    }
    
    private func inviteUser() {
        guard !email.isEmpty else {
            self.result = .failure(NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "Email cannot be empty"]))
            return
        }
        
        guard let accessToken = appUser?.accessToken else {
            self.result = .failure(NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "Access token is missing"]))
            return
        }

        isLoading = true
        result = nil
        
        NetworkService.shared.inviteUser(email: email, accessToken: accessToken) { result in
            DispatchQueue.main.async {
                self.isLoading = false
                self.result = result
            }
        }
    }
}

#Preview {
    InviteView(showInviteView: .constant(false), appUser: .constant(.init(uid: "12345", email: "hello@example.com", accessToken: "")))
}
