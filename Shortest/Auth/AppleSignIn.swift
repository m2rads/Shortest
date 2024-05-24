//
//  AppleSignIn.swift
//  Shortest
//
//  Created by m2rads on 2024-05-20.
//

import Foundation
import CryptoKit
import AuthenticationServices

struct AppleSignInResult {
    let idToken: String
    let nonce: String
    let email: String?
}

@MainActor
class AppleSignIn: NSObject {
    
    fileprivate var currentNonce: String?
    private var continuation: CheckedContinuation<AppleSignInResult, Error>?
    
    func startSignInWithAppleFlow() async throws -> AppleSignInResult {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<AppleSignInResult, Error>) in
            self.continuation = continuation
            self.startSignInWithAppleFlow()
        }
    }
    
    private func startSignInWithAppleFlow() {
        guard let topVC = UIApplication.getTopViewController() else {
            print("Unable to get top view controller")
            continuation?.resume(throwing: NSError(domain: "AppleSignInError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Unable to get top view controller."]))
            continuation = nil
            return
        }
        let nonce = randomNonceString()
        currentNonce = nonce
        let appleIDProvider = ASAuthorizationAppleIDProvider()
        let request = appleIDProvider.createRequest()
        request.requestedScopes = [.fullName, .email]
        request.nonce = sha256(nonce)
        
        let authorizationController = ASAuthorizationController(authorizationRequests: [request])
        authorizationController.delegate = self
        authorizationController.presentationContextProvider = topVC
        authorizationController.performRequests()
    }
    
    private func randomNonceString(length: Int = 32) -> String {
        precondition(length > 0)
        var randomBytes = [UInt8](repeating: 0, count: length)
        let errorCode = SecRandomCopyBytes(kSecRandomDefault, randomBytes.count, &randomBytes)
        if errorCode != errSecSuccess {
            fatalError(
                "Unable to generate nonce. SecRandomCopyBytes failed with OSStatus \(errorCode)"
            )
        }
        
        let charset: [Character] =
        Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        
        let nonce = randomBytes.map { byte in
            charset[Int(byte) % charset.count]
        }
        
        return String(nonce)
    }
    
    private func sha256(_ input: String) -> String {
        let inputData = Data(input.utf8)
        let hashedData = SHA256.hash(data: inputData)
        let hashString = hashedData.compactMap {
            String(format: "%02x", $0)
        }.joined()
        
        return hashString
    }
}

extension AppleSignIn: ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return ASPresentationAnchor(frame: .zero)
    }
    
    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        if let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential {
            guard let nonce = currentNonce else {
                fatalError("Invalid state: A login callback was received, but no login request was sent.")
            }
            guard let appleIDToken = appleIDCredential.identityToken else {
                print("Unable to fetch identity token")
                continuation?.resume(throwing: NSError(domain: "AppleSignInError", code: -2, userInfo: [NSLocalizedDescriptionKey: "Unable to fetch identity token."]))
                continuation = nil
                return
            }
            guard let idTokenString = String(data: appleIDToken, encoding: .utf8) else {
                print("Unable to serialize token string from data: \(appleIDToken.debugDescription)")
                continuation?.resume(throwing: NSError(domain: "AppleSignInError", code: -3, userInfo: [NSLocalizedDescriptionKey: "Unable to serialize token string from data."]))
                continuation = nil
                return
            }
            
            let email = appleIDCredential.email
            print("Apple sign-in successful. ID Token: \(idTokenString), Nonce: \(nonce), Email: \(String(describing: email))")
            let appleSignInResult = AppleSignInResult(idToken: idTokenString, nonce: nonce, email: email)
            continuation?.resume(returning: appleSignInResult)
            continuation = nil
        } else {
            continuation?.resume(throwing: NSError(domain: "AppleSignInError", code: -4, userInfo: [NSLocalizedDescriptionKey: "Unexpected credential type."]))
            continuation = nil
        }
    }
    
    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        print("Sign in with Apple errored: \(error)")
        continuation?.resume(throwing: error)
        continuation = nil
    }
}


extension UIViewController: ASAuthorizationControllerPresentationContextProviding {
    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return self.view.window!
    }
    
    
}


extension UIApplication {
    class func getTopViewController(base: UIViewController? = UIApplication.shared.connectedScenes
        .compactMap { $0 as? UIWindowScene }
        .flatMap { $0.windows }
        .first { $0.isKeyWindow }?.rootViewController) -> UIViewController? {
            
            if let nav = base as? UINavigationController {
                return getTopViewController(base: nav.visibleViewController)
                
            } else if let tab = base as? UITabBarController, let selected = tab.selectedViewController {
                return getTopViewController(base: selected)
                
            } else if let presented = base?.presentedViewController {
                return getTopViewController(base: presented)
            }
            return base
        }
}
