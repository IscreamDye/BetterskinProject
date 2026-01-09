import React, { useState } from "react";
import { router } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { BlurView } from "expo-blur";
import loginbg from "../assets/bg/betterskin_bg2.jpg";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter email and password");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Login failed", error.message);
      return;
    }

    const userId = data.user.id; // 👈 get logged-in user ID

    try {
      const completed = await AsyncStorage.getItem(
        `onboardingComplete:${userId}`
      );

      if (completed === "true") {
        router.replace("/profile"); // user already did survey
      } else {
        router.replace("/quiz"); // user has not done survey
      }
    } catch (e) {
      console.error("Failed to check onboarding:", e);
      router.replace("/profile"); // fallback
    }
  };

  return (
    <ImageBackground source={loginbg} style={styles.background}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.wrapper}>
            <BlurView intensity={50} style={styles.container}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.headerRow}>
                  <Text style={styles.title}>Log in</Text>
                  <Text
                    style={styles.title_mid}
                    onPress={() => router.push("/signup")}
                  >
                    Sign up
                  </Text>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#555"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#555"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="done"
                />

                <View style={styles.headerRow}>
                  <Text
                    style={styles.title_s}
                    onPress={() => Alert.alert("Coming soon")}
                  >
                    Forgot password
                  </Text>

                  <TouchableOpacity onPress={signIn} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator />
                    ) : (
                      <Text style={styles.title_s}>Sign In</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </BlurView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: "cover" },
  wrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: {
    width: "90%",
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#f5efe6ff",
    opacity: 0.9,
    overflow: "hidden",
  },
  title: { fontSize: 32, color: "#8a8076", textAlign: "center" },
  title_mid: { fontSize: 22, color: "#8a8076", textAlign: "center" },
  title_s: { fontSize: 16, color: "#8a8076", textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "rgba(85, 85, 85, 0.7)",
    padding: 10,
    marginBottom: 20,
    borderRadius: 20,
    color: "#555",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
});
