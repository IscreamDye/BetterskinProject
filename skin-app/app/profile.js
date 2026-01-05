import BottomNav from "./BottomNav"; // adjust path if needed
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router"; // Expo Router
import loginbg from "../assets/images/bg/img3.jpg";
import { supabase } from "../lib/supabase"; // if using Supabase auth

const sponsoredProducts = [
  { id: 1, name: "Cleanser X", rating: 4.5 },
  { id: 2, name: "Serum Pro", rating: 4.2 },
  { id: 3, name: "Moisture Plus", rating: 4.8 },
  { id: 4, name: "Glow Cream", rating: 4.1 },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets(); // safe area for top/bottom

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      Alert.alert("Logged out", "You have been logged out successfully.");
      router.replace("/"); // redirect to login page
    } catch (error) {
      Alert.alert("Logout failed", error.message);
    }
  };

  return (
    <ImageBackground source={loginbg} style={styles.background}>
      <View style={styles.overlay}>
        {/* Header with Logout */}
        <View style={[styles.headerRow, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Sponsored products */}
        <ScrollView
          contentContainerStyle={[
            styles.productsGrid,
            { paddingBottom: insets.bottom + 100 }, // space for BottomNav
          ]}
        >
          {sponsoredProducts.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <View style={styles.productImage}>
                <Text style={styles.imageText}>Image</Text>
              </View>
              <Text style={styles.productName}>{item.name}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>⭐ {item.rating}</Text>
                <Text style={styles.icon}>♡</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Shared Bottom Navigation */}
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

  // Products grid
  productsGrid: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
  },
  productImage: {
    height: 120,
    borderRadius: 15,
    backgroundColor: "#d0d0d0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  imageText: {
    color: "#555",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3f3f3f",
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    color: "#3f3f3f",
  },
  icon: {
    fontSize: 18,
    color: "#999",
  },
});
