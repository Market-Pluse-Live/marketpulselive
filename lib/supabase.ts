import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create Supabase client only if configured
export const supabase: SupabaseClient | null = isSupabaseConfigured
	? createClient(supabaseUrl, supabaseAnonKey)
	: null;

// Types for database tables
export interface DbUser {
	id: string;
	name: string;
	email: string;
	password_hash: string;
	avatar?: string;
	created_at: string;
	updated_at: string;
}

export interface DbRoom {
	id: string;
	name: string;
	stream_url: string;
	stream_type: "youtube" | "hls" | "embed";
	is_active: boolean;
	company_id: string;
	thumbnail?: string;
	auto_start: boolean;
	created_at: string;
	updated_at: string;
}
