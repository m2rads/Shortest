//
//  DataModel.swift
//  Shortest
//
//  Created by m2rads on 2024-05-18.
//

import Foundation

struct Profile: Codable {
  let username: String?
  let fullName: String?
  let bio: String?
  let avatarURL: String?

  enum CodingKeys: String, CodingKey {
    case username
    case fullName = "full_name"
    case bio
    case avatarURL = "avatar_url"
  }
}
