import BottomNav from "./BottomNav"; // adjust path if needed
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { router } from "expo-router";
import loginbg from "../assets/images/bg/img3.jpg";
import { supabase } from "../lib/supabase";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [uvData, setUvData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      Alert.alert("Logged out", "You have been logged out successfully.");
      router.replace("/"); // redirect to login page
    } catch (error) {
      Alert.alert("Logout failed", error.message);
    }
  };

  // Get user's current location
  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Cannot access location.");
      return null;
    }
    const location = await Location.getCurrentPositionAsync({});
    return location.coords; // { latitude, longitude }
  };

  // Fetch UV data from OpenUV
  const fetchUVData = async () => {
    setLoading(true);
    try {
      const coords = await getUserLocation();
      if (!coords) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://api.openuv.io/api/v1/uv?lat=${coords.latitude}&lng=${coords.longitude}`,
        {
          headers: {
            "x-access-token": "openuv-2x9krmk2fbn3r-io", // 
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUvData(data.result);
    } catch (error) {
      Alert.alert("Failed to fetch UV data", error.message);
      console.error("UV fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUVData();
  }, []);

  return (
    <ImageBackground source={loginbg} style={styles.background}>
      <View style={styles.overlay}>
        {/* Header with Logout */}
        <View style={[styles.headerRow, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.headerTitle}>BETTERSKIN</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable content */}
        <ScrollView
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 100 },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : uvData ? (
            <View style={styles.uvCard}>
              <Text style={styles.sectionTitle}>UV Index</Text>
              <Text style={styles.uvText}>Current UV: {uvData.uv.toFixed(2)}</Text>
              <Text style={styles.uvText}>Max UV Today: {uvData.uv_max.toFixed(2)}</Text>
              {uvData.safe_exposure_time?.st1 && (
                <Text style={styles.uvText}>
                  Safe Exposure (Skin Type 1): {uvData.safe_exposure_time.st1} mins
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.errorText}>Unable to fetch UV data</Text>

          )}

        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNav />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1 },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#3f3f3f",
    fontFamily: 'Poppins'
  },
  logoutButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
  },

  // Scroll content
  contentContainer: {
    padding: 16,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#3f3f3f",
  },
  uvCard: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    padding: 20,
    alignItems: "left",
  },
  uvText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#3f3f3f",
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
});
