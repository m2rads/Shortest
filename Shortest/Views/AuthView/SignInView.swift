//
//  SignInView.swift
//  Shortest
//
//  Created by m2rads on 2024-05-20.
//

import SwiftUI

class SignInViewModel: ObservableObject {
    
    func SignInWithApple(){} 
}

struct SignInView: View {
    @StateObject var viewModel = SignInViewModel()
    
    var body: some View {
        Button {
            print("apple")
        } label: {
            Text("Sign in with Apple")
                .foregroundStyle(.black)
        }
    }
}

#Preview {
    SignInView()
}
