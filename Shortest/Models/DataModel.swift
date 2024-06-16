//
//  DataModel.swift
//  Shortest
//
//  Created by m2rads on 2024-05-18.
//

import Foundation

struct Profile: Codable {
    let id: UUID
    let username: String?
    let fullName: String?
    let bio: String?
    let avatarURL: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case username
        case fullName = "full_name"
        case bio
        case avatarURL = "avatar_url"
    }
}

struct GroupModel: Codable {
    let id: UUID
    let name: String
    let description: String?
    let creator_id: UUID
}

struct GroupMembership: Codable {
    let id: UUID
    let group_id: UUID
    let user_id: UUID
    let joined_at: Date
}

struct Message: Identifiable, Codable {
    let id: UUID
    let content: String
    let group_id: UUID
    let user_id: UUID
    let timestamp: Date
    let userName: String
    let userHandle: String
    let groupName: String
}

struct SearchResult: Identifiable, Codable {
    let id: UUID
    var group: GroupModel?
    var user: Profile?
    
    enum CodingKeys: String, CodingKey {
        case id
        case group
        case user
    }
}

struct SearchResponse: Codable {
    let id: UUID
    let type: String
    let username: String?
    let full_name: String?
    let bio: String?
    let avatar_url: String?
    let name: String?
    let description: String?
}
