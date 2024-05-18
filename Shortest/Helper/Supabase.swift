//
//  Supabase.swift
//  Shortest
//
//  Created by m2rads on 2024-05-18.
//

import Foundation
import Supabase

struct Config {
    static let supabaseURL: String = {
        guard let url = ProcessInfo.processInfo.environment["SUPABASE_URL"] else {
            fatalError("SUPABASE_URL not set in environment variables")
        }
        return url
    }()
    
    static let supabaseKey: String = {
        guard let key = ProcessInfo.processInfo.environment["SUPABASE_KEY"] else {
            fatalError("SUPABASE_KEY not set in environment variables")
        }
        return key
    }()
}

let supabase = SupabaseClient(supabaseURL: URL(string: Config.supabaseURL)!, supabaseKey: Config.supabaseKey)
