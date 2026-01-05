import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function BottomNav() {
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <BlurView intensity={80} style={styles.bottomBar}>
        <NavButton label="Home" onPress={() => router.push("/profile")} />
        <NavButton label="My Products" onPress={() => router.push("/myproducts")} />
        <NavButton label="Routine" onPress={() => router.push("/routine")} />
      </BlurView>
    </SafeAreaView>
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
  safeArea: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    backgroundColor: "rgba(255,255,255,0.85)",
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
