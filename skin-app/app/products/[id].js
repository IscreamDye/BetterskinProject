import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import CameraScreen from "./camera"; // modal camera

const categories = [
  "Cleanser",
  "Toner",
  "Serum / Active Ingredients",
  "Moisturizer",
  "Sunscreen",
  "Eye cream",
  "Exfoliant",
];

export default function EditProduct() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState(null);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [category, setCategory] = useState("Cleanser");
  const [imageUri, setImageUri] = useState(null);

  const [showCamera, setShowCamera] = useState(false);

  // ✅ Load product once
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      const stored = await AsyncStorage.getItem("products");
      const products = stored ? JSON.parse(stored) : [];
      const found = products.find((p) => p.id === id);
      if (!found) return;

      setProduct(found);
      setName(found.name);
      setBrand(found.brand || "");
      setIngredients(found.ingredients || "");
      setCategory(found.category || "Cleanser");
      setImageUri(found.imageUri || null);
    };
    loadProduct();
  }, [id]);

  if (!product) return null; // optional: loading indicator

  const saveChanges = async () => {
    const stored = await AsyncStorage.getItem("products");
    const products = stored ? JSON.parse(stored) : [];

    const updated = products.map((p) =>
      p.id === id
        ? { ...p, name, brand, ingredients, category, imageUri }
        : p
    );

    await AsyncStorage.setItem("products", JSON.stringify(updated));
    router.back(); // go back to MyProducts
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <TouchableOpacity
        style={styles.image}
        activeOpacity={0.85}
        onPress={() => setShowCamera(true)}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.fullImage} />
        ) : (
          <Text style={styles.addPhotoText}>＋</Text>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Product name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Brand"
        style={styles.input}
        value={brand}
        onChangeText={setBrand}
      />
      <TextInput
        placeholder="Ingredients"
        style={[styles.input, { height: 80 }]}
        value={ingredients}
        onChangeText={setIngredients}
        multiline
      />

      <View style={styles.categoryRow}>
        {categories.map((c) => (
          <Text
            key={c}
            style={[styles.category, category === c && styles.activeCategory]}
            onPress={() => setCategory(c)}
          >
            {c}
          </Text>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
        <Text style={styles.saveText}>Save changes</Text>
      </TouchableOpacity>

      {/* Camera modal */}
      <Modal visible={showCamera} animationType="slide">
        <CameraScreen
          onPhotoTaken={(uri) => {
            setImageUri(uri);
            setShowCamera(false);
          }}
          onCancel={() => setShowCamera(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: "#f2f2f2" },
  image: {
    height: 220,
    borderRadius: 20,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  fullImage: { width: "100%", height: "100%", borderRadius: 20 },
  addPhotoText: { fontSize: 48, color: "#777" },
  input: { backgroundColor: "#fff", borderRadius: 15, padding: 14, marginBottom: 15, fontSize: 16 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 25 },
  category: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: "#e0e0e0", marginRight: 10, marginBottom: 10 },
  activeCategory: { backgroundColor: "#333", color: "#fff" },
  saveButton: { backgroundColor: "#3f3f3f", paddingVertical: 16, borderRadius: 20, alignItems: "center" },
  saveText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
