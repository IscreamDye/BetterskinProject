import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Supabase configuration from app.config.js (supports environment variables)
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration. Check app.config.js and environment variables.");
}

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Note: detectSessionInUrl doesn't work in React Native
    // We handle URL parsing manually in authHelpers.js
    detectSessionInUrl: false,
    // Use PKCE flow (more secure than implicit)
    flowType: "pkce",
  },
});
