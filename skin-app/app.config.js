// app.config.js - Expo configuration with environment variables
// This file extends app.json and adds environment variable support

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    // Supabase configuration from environment variables
    // Set these in your .env file or EAS secrets
    supabaseUrl: process.env.SUPABASE_URL || "https://gvasijloxlpxxsrffuod.supabase.co",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2YXNpamxveGxweHhzcmZmdW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NTcxMTUsImV4cCI6MjA4MTQzMzExNX0.JnjgBml-6_GvmUZpYUYTHllajFct0nsxy518XcloQ7E",
  },
});
