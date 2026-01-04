import { router } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import loginbg from "../assets/images/bg/img3.jpg";

const sponsoredProducts = [
  { id: 1, name: "Cleanser X", rating: 4.5 },
  { id: 2, name: "Serum Pro", rating: 4.2 },
  { id: 3, name: "Moisture Plus", rating: 4.8 },
  { id: 4, name: "Glow Cream", rating: 4.1 },
];

export default function DashboardScreen() {
  return (
    <ImageBackground source={loginbg} style={styles.background}>
      <View style={styles.overlay}>

        {/* Sponsored products */}
        <ScrollView contentContainerStyle={styles.productsGrid}>
          {sponsoredProducts.map((item) => (
            <View key={item.id} style={styles.productCard}>
              {/* Image placeholder */}
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

        {/* Bottom navigation */}
        <BlurView intensity={80} style={styles.bottomBar}>
          <NavButton label="Home" onPress={() => router.push("/")} />
           
          <NavButton label="My Products" onPress={() => router.push("/myproducts")} />
          <NavButton label="Profile" onPress={() => router.push("/routine")} />
        </BlurView>

      </View>
    </ImageBackground>
  );
}

function NavButton({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.navButton} onPress={onPress}>
      <Text style={styles.navText}>{label}</Text>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1 },

  productsGrid: {
    padding: 16,
    paddingBottom: 120, // space for bottom bar
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

  bottomBar: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    backgroundColor: "rgba(255,255,255,0.85)",
  },

  navButton: {
    alignItems: "center",
  },

  navText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3f3f3f",
  },
});
