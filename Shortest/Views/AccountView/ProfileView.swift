//
//  ProfileView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-21.
//

import SwiftUI

struct ProfileView: View {
    @Binding var appUser: AppUser?
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading) {
                    // Profile picture and info
                    HStack(alignment: .top) {
                        Image("ppfPlaceHolder")
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 80, height: 80)
                            .clipShape(Circle())
                            .overlay(Circle().stroke(Color.white, lineWidth: 4))
                            .padding(.leading)
                        
                        VStack(alignment: .leading) {
                            Text("@Mohrad23")
                                .font(.subheadline)
                                .foregroundColor(.gray)
                            
                            Text("Mohammad Rad")
                                .font(.title2)
                                .bold()
                        }
                        .padding(.leading)
                        Spacer()
                    }
                    .padding(.top, 20)
                    .padding(.bottom, 20)
                    
                    // Bio and website
                    VStack(alignment: .leading) {
                        Text("just a dude who codes · my notebook 👉 [github.com/m2rads](https://github.com/m2rads)")
                            .font(.body)
                            .padding(.bottom, 5)
                        
                        HStack {
                            HStack {
                                Text("4")
                                    .bold()
                                Text("Following")
                                Text("1")
                                    .bold()
                                Text("Followers")
                            }
                            .font(.footnote)
                            .foregroundColor(.gray)
                            .padding(.top, 5)
                            
                            Spacer()
                            
                            Button(action: {
                                print("clicked")
                            }, label: {
                                Image(systemName: "gift.circle.fill")
                                    .foregroundColor(.gray)
                            })
                            .padding(.bottom, -6)
                        }
                    }
                    .padding(.horizontal)
                    
                    // Empty state for messages
                    VStack {
                        Text("No thoughts yet")
                            .font(.body)
                            .foregroundColor(.gray)
                            .padding()
                        Spacer()
                    }
                }
                .padding(.top, 20)
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: {
                        // Action for going back
                    }) {
                        Image(systemName: "chevron.left")
                            .foregroundColor(.gray)
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        NavigationLink(destination: EditProfile(appUser: $appUser)) {
                            Text("Edit Profile")
                        }
                        Button(action: {
                            Task {
                                do {
                                    try await AuthManager.shared.signOut()
                                    self.appUser = nil
                                } catch {
                                    print("unable to sign out at this time")
                                }
                            }
                        }) {
                            Text("Sign Out")
                        }
                    } label: {
                        Image(systemName: "ellipsis")
                            .foregroundColor(.gray)
                    }
                }
            }
        }
    }
}

#Preview {
    ProfileView(appUser: .constant(.init(uid: "12345", email: "hello@example.com")))
}
