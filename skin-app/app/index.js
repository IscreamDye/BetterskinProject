import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import loginbg from "../assets/bg/betterskin_bg2.jpg";
import { supabase } from "../lib/supabase";
import { signInWithGoogle } from "../lib/authHelpers";

/**
 * Index.js - Auth Gatekeeper
 *
 * Flow:
 * 1. Check if user has active Supabase session
 * 2. If NO session → Show "Continue with Google" button
 * 3. If session exists → Ensure profile row exists
 * 4. Route to /profile (quiz done) or /quiz (quiz not done)
 */
export default function AuthGateway() {
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState([]);

  useEffect(() => {
    checkAuthAndRoute();
    // Note: Auth state changes are handled in _layout.js to avoid duplicate subscriptions
  }, []);

  const checkAuthAndRoute = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
        setLoading(false);
        return;
      }

      if (!session) {
        setLoading(false);
        return;
      }

      await routeAuthenticatedUser(session.user.id);
    } catch (err) {
      console.error("Auth check failed:", err);
      setLoading(false);
    }
  };

  const routeAuthenticatedUser = async (userId) => {
    try {
      const log = (msg) => {
        console.log(msg);
        setDebugInfo(prev => [...prev, msg]);
      };
      
      log("🔍 Checking quiz status for user: " + userId);
      
      // Fetch user profile from Supabase
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("quiz_completed")
        .eq("id", userId)
        .single();

      log("📊 Profile data: " + JSON.stringify(profile));
      log("❌ Error: " + JSON.stringify(error));

      if (error) {
        log("➡️ No profile → routing to /quiz");
        router.replace("/quiz");
        return;
      }

      log("🔍 quiz_completed: " + profile?.quiz_completed);
      log("🔍 Type: " + typeof profile?.quiz_completed);

      if (profile.quiz_completed === true) {
        log("✅ Quiz done → /profile");
        router.replace("/profile");
      } else {
        log("⏸️ Quiz not done → /quiz");
        router.replace("/quiz");
      }
    } catch (err) {
      console.error("Routing error:", err);
      setDebugInfo(prev => [...prev, "❌ Error: " + err.message]);
      router.replace("/quiz");
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const session = await signInWithGoogle();
      if (session) {
        // OAuth successful - route user
        await routeAuthenticatedUser(session.user.id);
      }
    } catch (err) {
      console.error("Sign in failed:", err);
    } finally {
      setGoogleLoading(false);
    }
  };

  if (loading) {
    return (
      <ImageBackground source={loginbg} style={styles.background}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={loginbg} style={styles.background}>
      <View style={styles.wrapper}>
        <BlurView intensity={50} style={styles.container}>
          {/* Debug Info Panel - only visible in development */}
          {__DEV__ && debugInfo.length > 0 && (
            <View style={styles.debugBox}>
              <Text style={styles.debugTitle}>🔍 Debug:</Text>
              {debugInfo.slice(-5).map((log, i) => (
                <Text key={i} style={styles.debugText}>{log}</Text>
              ))}
            </View>
          )}

          <Text style={styles.title}>BETTERSKIN</Text>
          <Text style={styles.title}>v16</Text>
          <Text style={styles.subtitle}>
            Personalized skincare recommendations
          </Text>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.googleButtonText}>
                Continue with Google
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Your personalized skincare journey starts here
          </Text>
        </BlurView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    padding: 40,
    borderRadius: 20,
    backgroundColor: "rgba(245, 239, 230, 0.95)",
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    color: "#3f3f3f",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  googleButton: {
    width: "100%",
    backgroundColor: "#4285F4",
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  footerText: {
    fontSize: 14,
    color: "#8a8076",
    textAlign: "center",
    marginTop: 10,
  },
  debugBox: {
    width: "100%",
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    maxHeight: 120,
  },
  debugTitle: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 12,
  },
  debugText: {
    color: "#0f0",
    fontSize: 10,
    fontFamily: "monospace",
    marginVertical: 1,
  },
});
