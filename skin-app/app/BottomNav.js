import { Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function BottomNav() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={80} style={styles.bottomBar}>
        <NavButton label="Home" onPress={() => router.push("/profile")} />
        <NavButton label="My Products" onPress={() => router.push("/myproducts")} />
        <NavButton label="Routine" onPress={() => router.push("/routine")} />
        <NavButton label="Profile" onPress={() => router.push("/myprofile")} />
      </BlurView>
    </View>
  );
}

function NavButton({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.navButton} onPress={onPress}>
      <Text style={styles.navText}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.85)", // fallback behind blur
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 15,
    paddingBottom: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
