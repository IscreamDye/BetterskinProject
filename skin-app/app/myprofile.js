import { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ImageBackground,
} from "react-native";
import { BlurView } from "expo-blur";
import { supabase } from "../lib/supabase";
import loginbg from "../assets/images/bg/img3.jpg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "./BottomNav"; // adjust path if needed

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState([]);

  const questionLabels = [
    "My skin type",
    "Skin concerns",
    "Diagnosed skin conditions",
    "Ingredients that irritate my skin",
    "Health factors affecting my skin",
    "Main skincare goal",
    "Preferred product style",
    "Comfortable price range",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    const fetchAnswers = async () => {
      try {
        const stored = await AsyncStorage.getItem("surveyAnswers");
        if (stored) setAnswers(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load survey answers", e);
      }
    };

    fetchUser();
    fetchAnswers();
  }, []);

  return (
    <ImageBackground source={loginbg} style={styles.background}>
      <ScrollView contentContainerStyle={styles.wrapper}>
        <BlurView intensity={100} style={styles.container}>
          {/* User Info */}
          <Text style={styles.header}>Profile</Text>
          <View style={styles.userBox}>
            <Text style={styles.userText}>
              {user?.user_metadata?.first_name || ""}{" "}
              {user?.user_metadata?.last_name || ""}
            </Text>
          </View>

          {/* Survey Answers */}
          {answers.map((ans, idx) => (
            <View key={idx} style={styles.answerBox}>
              <Text style={styles.answerLabel}>{questionLabels[idx]}:</Text>
              <Text style={styles.answerText}>
                {Array.isArray(ans) ? ans.join(", ") : ans}
              </Text>
            </View>
          ))}

        </BlurView>
      </ScrollView>
      <BottomNav />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: "cover" },
  wrapper: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  container: {
    width: "90%",
    padding: 25,
    borderRadius: 20,
    backgroundColor: "rgba(231,231,231,0.81)",
    overflow: "hidden",
    alignItems: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#3f3f3fff",
  },
  userBox: {
    width: "100%",
    padding: 20,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.85)",
    marginBottom: 20,
    alignItems: "center",
  },
  userText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3f3f3f",
  },
  answerBox: {
    width: "100%",
    padding: 15,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.85)",
    marginBottom: 15,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
    color: "#3f3f3f",
  },
  answerText: {
    fontSize: 16,
    color: "#555",
  },
});
