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
import loginbg from "../assets/images/bg/img1.jpg";
import { supabase } from "../lib/supabase";

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Login failed", error.message);
    } else {
      router.replace("/profile");
    }
  };

  return (
    <ImageBackground source={loginbg} style={styles.background}>
      <View style={styles.wrapper}>
        <BlurView intensity={100} style={styles.container}>
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
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#555"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
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
                <Text style={styles.title_s}>SignIn</Text>
              )}
            </TouchableOpacity>
          </View>
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
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // centers the form horizontally
  },
  container: {
    width: "90%",
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(231, 231, 231, 0.81)", // semi-transparent for glass
    overflow: "hidden", // required for BlurView to clip
    
  },
  title: {
    fontSize: 32,
    //fontWeight: "bold",
    //marginBottom: 20,
    color: "#3f3f3fff",
    textAlign: "center",
  },
  title_mid: {
    fontSize: 22,
    color: "#3f3f3fff",
    textAlign: "center",
  },
  title_s: {
    fontSize: 16,
    color: "#3f3f3fff",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(85, 85, 85, 0.7)",
    padding: 10,
    marginBottom: 20,
    borderRadius: 20,
    color: "#fff",
  },
  headerRow: {
  flexDirection: "row",       
  justifyContent: "space-between", 
  alignItems: "center",       
  marginBottom: 20,
}
});