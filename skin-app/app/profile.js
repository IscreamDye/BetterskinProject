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
import { signOut } from "../lib/authHelpers";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();

  const [uvData, setUvData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.replace("/");
    };
    checkAuth();
  }, []);


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
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  /* ---------------- LOAD PRODUCTS BASED ON USER'S SKIN CONCERNS ---------------- */
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        // Only fetch products after we have skin concerns
        let query = supabase.from('recomandedProducts').select('*');
        
        // If user has skin concerns, filter by SkinGoal
        if (skinConcerns.length > 0) {
          query = query.in('SkinGoal', skinConcerns);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching products:', error);
          setProducts([]);
        } else {
          // Map database columns to expected format
          const mappedProducts = (data || []).map(item => ({
            id: item.id,
            name: item.Name,
            photo: { uri: item.Img },
            skinGoal: item.SkinGoal,  // This matches user's skin concerns
            price: item.Price,
            category: item.Category,
          }));
          setProducts(mappedProducts);
        }
      } catch (err) {
        console.error('Error loading products:', err);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [skinConcerns]); // Re-fetch when skin concerns change

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

  /* ---------------- LOAD QUIZ FROM SUPABASE ---------------- */
  useEffect(() => {
    const loadQuizFromSupabase = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) return;

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('quiz_answers')
          .eq('id', authData.user.id)
          .single();

        if (error) {
          console.error("Error loading quiz answers:", error);
          return;
        }

        if (profile?.quiz_answers && profile.quiz_answers.length > 1) {
          // quiz_answers[1] contains skin concerns (question index 1)
          const concerns = profile.quiz_answers[1] || [];
          console.log("Loaded skin concerns from Supabase:", concerns);
          setSkinConcerns(concerns);
        }
      } catch (e) {
        console.error("Failed to load quiz data from Supabase", e);
      }
    };

    loadQuizFromSupabase();
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
      `Thank you ${checkout.name}!\n\n${selectedProduct.name}\n€${Number(selectedProduct.price || 0).toFixed(2)}`
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
            onPress={signOut}
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
                  Today`s UV is high -- SPF is essential!
                </Text>
                <Text style={styles.greetingText}>
                   We noticed you skipped Vitamin C yesterday, so we`ve adjusted today`s routine to keep you on track.
                </Text>
                <Text style={styles.greetingFooter}>Have a great day!</Text>
              </View>
)}


          {/* RECOMMENDATIONS */}
          <View style={styles.recommendBox}>
            <Text style={styles.sectionTitle}>Recommended Products</Text>
            
            {skinConcerns.length > 0 ? (
              <Text style={styles.concernsText}>
                For your skin concerns: {skinConcerns.join(", ")}
              </Text>
            ) : (
              <Text style={styles.concernsText}>
                Complete the quiz to get personalized recommendations
              </Text>
            )}

            {productsLoading ? (
              <ActivityIndicator style={{ marginTop: 15 }} />
            ) : products.length === 0 ? (
              <View style={styles.noProductsBox}>
                <Text style={styles.noProductsText}>
                  {skinConcerns.length > 0 
                    ? "No products found for your skin concerns" 
                    : "No products available"}
                </Text>
              </View>
            ) : (
              products.map((p, i) => (
                <TouchableOpacity
                  key={p.id || i}
                  style={styles.productRow}
                  onPress={() => setSelectedProduct(p)}
                >
                  <Image source={p.photo} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{p.name}</Text>
                    <Text style={styles.productSkinGoal}>For: {p.skinGoal}</Text>
                    <Text style={styles.productPrice}>€{Number(p.price || 0).toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>

      <Modal visible={!!selectedProduct} transparent animationType="slide">
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <Text style={styles.modalHeader}>{selectedProduct.name}</Text>
                <Image source={selectedProduct.photo} style={styles.productImageLarge} />
                <Text style={styles.modalSkinGoal}>For: {selectedProduct.skinGoal}</Text>
                <Text style={styles.modalPrice}>
                  €{Number(selectedProduct.price || 0).toFixed(2)}
                </Text>
                {selectedProduct.category && (
                  <Text style={styles.modalCategory}>{selectedProduct.category}</Text>
                )}

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

                {/* ---------------- PLACE ORDER ---------------- */}
                {/* Note: Payment processing should be handled via Stripe or similar */}
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

  contentContainer: { alignItems: "center", padding: 16, paddingBottom: 100 },

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
    marginBottom: 20,
  },
  concernsText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
    fontStyle: "italic",
  },
  noProductsBox: {
    padding: 20,
    alignItems: "center",
  },
  noProductsText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  productImage: { width: 70, height: 70, borderRadius: 12 },
  productInfo: { marginLeft: 12, flex: 1 },
  productName: { fontSize: 16, fontWeight: "600", flexWrap: "wrap", marginBottom: 2 },
  productSkinGoal: { fontSize: 12, color: "#a98f7e", marginBottom: 4 },
  productPrice: { fontSize: 15, fontWeight: "600", color: "#3f3f3f" },

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
  modalSkinGoal: { fontSize: 14, color: "#a98f7e", marginTop: 10 },
  modalPrice: { fontSize: 20, fontWeight: "700", marginVertical: 6, color: "#3f3f3f" },
  modalCategory: { fontSize: 13, color: "#666", marginBottom: 15 },

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

