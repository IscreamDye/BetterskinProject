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
} from "react-native";
import { BlurView } from "expo-blur";
import loginbg from "../assets/images/bg/img2.jpg";
import { supabase } from "../lib/supabase";

export default function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Missing fields", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert("Signup failed", error.message);
    } else {
      Alert.alert(
        "Account created",
        "Please check your email to confirm your account"
      );
      router.replace("/");
    }
  };

  return (
    <ImageBackground source={loginbg} style={styles.background}>
      <View style={styles.wrapper}>
        <BlurView intensity={100} style={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.title_s}>Back</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="First name"
            placeholderTextColor="#555"
            value={firstName}
            onChangeText={setFirstName}
          />

          <TextInput
            style={styles.input}
            placeholder="Last name"
            placeholderTextColor="#555"
            value={lastName}
            onChangeText={setLastName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#555"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#555"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Re-enter password"
            placeholderTextColor="#555"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={styles.nextButton}
            onPress={signUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.nextButtonText}>Create account</Text>
            )}
          </TouchableOpacity>
        </BlurView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(231, 231, 231, 0.81)",
    overflow: "hidden",
  },
  title_s: {
    fontSize: 16,
    color: "#3f3f3f",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(85, 85, 85, 0.7)",
    padding: 12,
    marginBottom: 20,
    borderRadius: 20,
    color: "#333",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: "#6d6d6d",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});
