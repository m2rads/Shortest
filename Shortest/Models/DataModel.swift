//
//  DataModel.swift
//  Shortest
//
//  Created by m2rads on 2024-05-18.
//

import Foundation

struct Profile: Decodable {
  let username: String?
  let fullName: String?
  let website: String?

  enum CodingKeys: String, CodingKey {
    case username
    case fullName = "full_name"
    case website
  }
}

struct UpdateProfileParams: Encodable {
    let username: String
    let fullName: String
    let website: String
    
    enum Codingkeys: String, CodingKey {
        case username
        case fullName = "full_name"
        case website
    }
}
