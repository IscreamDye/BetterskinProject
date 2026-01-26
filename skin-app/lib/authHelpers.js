import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { supabase } from "./supabase";
import { Alert, Platform } from "react-native";

// Complete any pending auth sessions when app loads
WebBrowser.maybeCompleteAuthSession();

/**
 * Extract session from OAuth callback URL
 * Supports both PKCE (code) and implicit (tokens) flows
 */
const createSessionFromUrl = async (url) => {
  // Parse URL parameters
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  // PKCE flow: exchange code for session
  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return data.session;
  }

  // Fallback: implicit flow (less secure, for backwards compatibility)
  const { access_token, refresh_token } = params;
  if (access_token && refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;
    return data.session;
  }

  throw new Error("No valid auth parameters found in URL");
};

export const signInWithGoogle = async () => {
  try {
    // Create redirect URL for deep linking back to app
    const redirectUrl = Linking.createURL("auth/callback");
    
    // Validate redirect URL scheme
    if (!redirectUrl.startsWith("skinapp://")) {
      throw new Error("Invalid redirect URL scheme");
    }

    // Start OAuth flow with PKCE enabled (Supabase default)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
        // PKCE is enabled by default in Supabase JS v2+
      },
    });

    if (error) throw error;

    if (!data.url) {
      throw new Error("No OAuth URL returned");
    }

    // Open secure browser session
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl,
      {
        showInRecents: false,
        preferEphemeralSession: true, // Don't persist cookies/history
        // iOS specific: use ASWebAuthenticationSession
        // Android specific: use Custom Tabs
      }
    );

    // Always try to dismiss browser
    try {
      await WebBrowser.dismissBrowser();
    } catch {
      // Browser may already be dismissed
    }

    // Handle user cancellation
    if (result.type === "cancel" || result.type === "dismiss") {
      console.log("OAuth cancelled by user");
      return null;
    }

    if (result.type !== "success" || !result.url) {
      throw new Error("OAuth flow did not complete successfully");
    }

    // Validate returned URL matches our scheme
    if (!result.url.startsWith("skinapp://")) {
      throw new Error("Invalid callback URL received");
    }

    // Exchange code/tokens for session
    const session = await createSessionFromUrl(result.url);
    
    if (!session) {
      throw new Error("Failed to create session");
    }

    console.log("✅ OAuth successful:", session.user.email);
    return session;

  } catch (err) {
    console.error("Google sign-in error:", err);
    Alert.alert("Login Failed", err.message || "An error occurred during sign in");
    return null;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (err) {
    console.error("Sign out error:", err);
    Alert.alert("Sign Out Failed", err.message);
  }
};
