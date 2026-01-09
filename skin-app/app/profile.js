import BottomNav from "./BottomNav";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { router } from "expo-router";
import loginbg from "../assets/bg/betterskin_bg2.jpg";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();

  const [uvData, setUvData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- USER ---------------- */
  const [userName, setUserName] = useState("there");
  const [userLoading, setUserLoading] = useState(true);


  /* ---------------- QUIZ DATA ---------------- */
  const [skinConcerns, setSkinConcerns] = useState([]);

  /* ---------------- PRODUCT MODAL ---------------- */
  const [selectedProduct, setSelectedProduct] = useState(null);

  /* ---------------- CHECKOUT ---------------- */
  const [checkout, setCheckout] = useState({
    name: "Jane Doe",
    email: "jane@example.com",
    address: "123 Main Street, New York",
  });

  const updateField = (key, value) =>
    setCheckout(prev => ({ ...prev, [key]: value }));

  /* ---------------- PRODUCTS ---------------- */
  const products = [
    {
      name: "Acne Control Serum",
      photo: require("../assets/images/serum.jpg"),
      category: "Acne",
      price: 45,
      description: "Targets breakouts and reduces inflammation.",
    },
    {
      name: "Anti-Dryness Serum",
      photo: require("../assets/images/serum.jpg"),
      category: "Dryness",
      price: 45,
      description: "Deep hydration for dry skin.",
    },
    {
      name: "Brightening Serum",
      photo: require("../assets/images/serum.jpg"),
      category: "Dark spots",
      price: 52,
      description: "Fades dark spots and improves skin tone.",
    },
  ];

  /* ---------------- LOAD USER NAME ---------------- */
useEffect(() => {
  const fetchUser = async () => {
    setUserLoading(true);
    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      setUserName("there");
      setUserLoading(false);
      return;
    }

    const meta = data.user.user_metadata || {};
    const name =
      meta.first_name ||
      meta.full_name?.split(" ")[0] ||
      meta.name ||
      data.user.email?.split("@")[0] ||
      "there";

    setUserName(name);
    setUserLoading(false);
  };

  fetchUser();
}, []);


  /* ---------------- LOAD QUIZ ---------------- */
  useEffect(() => {
    const loadQuiz = async () => {
      const stored = await AsyncStorage.getItem("surveyAnswers");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSkinConcerns(parsed[1] || []);
      }
    };
    loadQuiz();
  }, []);

  /* ---------------- UV ---------------- */
  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;
    return (await Location.getCurrentPositionAsync({})).coords;
  };

const fetchUVData = async () => {
  setLoading(true);
  try {
    const coords = await getUserLocation();
    if (!coords) {
      setUvData(null);
      return;
    }

    const res = await fetch(
      `https://currentuvindex.com/api/v1/uvi?latitude=${coords.latitude}&longitude=${coords.longitude}`
    );

    const data = await res.json();
    console.log("UV API response:", data);

    if (data.ok) {
      setUvData({
        uv: data.now.uvi,                     // Current UV
        uv_max: data.forecast?.[0]?.uvi || data.now.uvi // Max UV (fallback to now)
      });
    } else {
      setUvData(null);
    }
  } catch (e) {
    console.log("UV error:", e.message);
    setUvData(null);
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchUVData();
  }, []);

  const handleBuy = () => {
    if (!selectedProduct) return;

    Alert.alert(
      "Order placed 🎉",
      `Thank you ${checkout.name}!\n\n${selectedProduct.name}\n$${selectedProduct.price.toFixed(
        2
      )}`
    );

    setSelectedProduct(null);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <ImageBackground source={loginbg} style={styles.background}>
      <View style={styles.overlay}>
        {/* Header */}
        <View style={[styles.headerRow, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.headerTitle}>BETTERSKIN</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              await supabase.auth.signOut();
              router.replace("/");
            }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          {/* UV */}
              <View style={styles.uvCard}>
                  <Text style={styles.sectionTitle}>UV Index</Text>
                  {loading ? (
                    <ActivityIndicator />
                  ) : uvData ? (
                    <>
                      <Text>Current: {uvData.uv?.toFixed(1) ?? "N/A"}</Text>
                      <Text>Max: {uvData.uv_max?.toFixed(1) ?? "N/A"}</Text>
                    </>
                  ) : (
                    <Text>UV data unavailable</Text>
                  )}
                </View>

          {/* GREETING */}
            {!userLoading && (
              <View style={styles.greetingBox}>
                <Text style={styles.greetingTitle}>Hi {userName}! ☀️</Text>
                <Text style={styles.greetingText}>
                  Today's UV is high -- SPF is essential!
                </Text>
                <Text style={styles.greetingText}>
                   We noticed you skipped Vitamin C yesterday, so we've adjusted today's routine to keep you on track.
                </Text>
                <Text style={styles.greetingFooter}>Have a great day!</Text>
              </View>
)}


          {/* RECOMMENDATIONS */}
          {skinConcerns.length > 0 && (
            <View style={styles.recommendBox}>
              <Text style={styles.recommendTitle}>
                Recommended products for:
              </Text>
              <Text>{skinConcerns.join(", ")}</Text>

              {products
                .filter(p => skinConcerns.includes(p.category))
                .map((p, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.productRow}
                    onPress={() => setSelectedProduct(p)}
                  >
                    <Image source={p.photo} style={styles.productImage} />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{p.name}</Text>
                      <Text>${p.price.toFixed(2)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </ScrollView>

      <Modal visible={!!selectedProduct} transparent animationType="slide">
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <Text style={styles.modalHeader}>{selectedProduct.name}</Text>
                <Image source={selectedProduct.photo} style={styles.productImageLarge} />
                <Text style={{ marginVertical: 6, fontWeight: "600" }}>
                  Price: ${selectedProduct.price.toFixed(2)}
                </Text>
                <Text style={{ marginBottom: 10 }}>{selectedProduct.description}</Text>

                {/* ---------------- USER INFO ---------------- */}
                <TextInput
                  style={styles.input}
                  value={checkout.name}
                  placeholder="Full Name"
                  onChangeText={v => updateField("name", v)}
                />
                <TextInput
                  style={styles.input}
                  value={checkout.email}
                  placeholder="Email"
                  keyboardType="email-address"
                  onChangeText={v => updateField("email", v)}
                />
                <TextInput
                  style={styles.input}
                  value={checkout.address}
                  placeholder="Address"
                  onChangeText={v => updateField("address", v)}
                />

                {/* ---------------- PAYMENT (OPTIONAL) ---------------- */}
                <TextInput
                  style={styles.input}
                  value={checkout.cardNumber || ""}
                  placeholder="Card Number"
                  keyboardType="number-pad"
                  onChangeText={v => updateField("cardNumber", v)}
                />
                <TextInput
                  style={styles.input}
                  value={checkout.expiry || ""}
                  placeholder="Expiry (MM/YY)"
                  onChangeText={v => updateField("expiry", v)}
                />
                <TextInput
                  style={styles.input}
                  value={checkout.cvv || ""}
                  placeholder="CVV"
                  keyboardType="number-pad"
                  onChangeText={v => updateField("cvv", v)}
                />

                {/* ---------------- PLACE ORDER ---------------- */}
                <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
                  <Text style={styles.buyText}>Place Order</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                  <Text style={styles.closeText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>


        <BottomNav />
      </View>
    </ImageBackground>
  );
}


/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: "600" },
  logoutButton: { backgroundColor: "#a98f7e", padding: 6, borderRadius: 10 },
  logoutText: { color: "#fff" },

  contentContainer: { alignItems: "center", padding: 16 },

  uvCard: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },

  greetingBox: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  greetingTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  greetingText: { fontSize: 14, marginBottom: 6 },
  greetingFooter: { fontSize: 14, fontWeight: "600", marginTop: 6 },

  recommendBox: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 16,
  },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  productImage: { width: 60, height: 60, borderRadius: 10 },
  productInfo: { marginLeft: 12 },
  productName: { fontSize: 16, fontWeight: "600" },
  productPrice: { fontSize: 14 },

  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 20,
    padding: 20,
  },

  modalHeader: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  modalPrice: { fontSize: 18, fontWeight: "700", marginVertical: 6 },
  modalDescription: { marginBottom: 10 },

  productImageLarge: { width: "100%", height: 200, borderRadius: 15 },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },

  buyButton: {
    backgroundColor: "#3f3f3f",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buyText: { color: "#fff", fontWeight: "600" },
  closeText: { textAlign: "center", marginTop: 10 },
});

