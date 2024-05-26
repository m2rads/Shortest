//
//  DataModel.swift
//  Shortest
//
//  Created by m2rads on 2024-05-18.
//

import Foundation

struct UpdateProfileParams: Encodable {
  let username: String
  let bio: String

  enum CodingKeys: String, CodingKey {
    case username
    case bio
  }
}
