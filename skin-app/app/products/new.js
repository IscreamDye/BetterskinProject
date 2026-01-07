import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CameraScreen from "./camera";
import { router } from "expo-router";

const categories = [
  "Cleanser",
  "Toner",
  "Serum / Active Ingredients",
  "Moisturizer",
  "Eye cream",
  "Exfoliant",
  "Sunscreen",
];

const serumTypes = [
  "Vitamin C",
  "Hyaluronic Acid",
  "Niacinamide",
  "Retinoid",
  "Glycolic Acid",
  "Lactic Acid",
  "Mandelic Acid",
  "BHA (Salicylic Acid)",
  "Peptide",
];

export default function NewProduct() {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [category, setCategory] = useState("Cleanser");
  const [serumType, setSerumType] = useState("");
  const [showSerumDropdown, setShowSerumDropdown] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const saveProduct = async () => {
    const stored = await AsyncStorage.getItem("products");
    const products = stored ? JSON.parse(stored) : [];

    const newProduct = {
      id: Date.now().toString(),
      name,
      brand,
      ingredients,
      category,
      serumType: category === "Serum / Active Ingredients" ? serumType : "",
      imageUri,
    };

    await AsyncStorage.setItem(
      "products",
      JSON.stringify([...products, newProduct])
    );

    router.replace("/myproducts");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* IMAGE */}
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

        {/* INPUTS */}
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

        {/* CATEGORY */}
        <View style={styles.categoryRow}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => {
                setCategory(c);
                setShowSerumDropdown(false);
                if (c !== "Serum / Active Ingredients") setSerumType("");
              }}
            >
              <Text
                style={[
                  styles.category,
                  category === c && styles.activeCategory,
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SERUM SELECT (INPUT-STYLE BOX) */}
        {category === "Serum / Active Ingredients" && (
          <View style={{ marginBottom: 30 }}>
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() => setShowSerumDropdown(!showSerumDropdown)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.selectText,
                  !serumType && { color: "#999" },
                ]}
              >
                {serumType || "Select active ingredient"}
              </Text>
            </TouchableOpacity>

            {/* DROPDOWN OVERLAY */}
            {showSerumDropdown && (
              <View style={styles.dropdownOverlay}>
                {serumTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSerumType(type);
                      setShowSerumDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* SAVE */}
        <TouchableOpacity style={styles.saveButton} onPress={saveProduct}>
          <Text style={styles.saveText}>Save Product</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* CAMERA */}
      <Modal visible={showCamera} animationType="slide">
        <CameraScreen
          onPhotoTaken={(uri) => {
            setImageUri(uri);
            setShowCamera(false);
          }}
          onCancel={() => setShowCamera(false)}
        />
      </Modal>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },

  image: {
    height: 220,
    borderRadius: 20,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },

  fullImage: {
    width: "100%",
    height: "100%",
  },

  addPhotoText: {
    fontSize: 48,
    color: "#777",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 14,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },

  category: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    marginRight: 10,
    marginBottom: 10,
  },

  activeCategory: {
    backgroundColor: "#333",
    color: "#fff",
  },

  /* SELECT BOX */
  selectBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  selectText: {
    fontSize: 16,
    color: "#333",
  },

  /* DROPDOWN */
  dropdownOverlay: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    zIndex: 999,
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  dropdownItemText: {
    fontSize: 16,
    color: "#333",
  },

  saveButton: {
    marginTop: 10,
    backgroundColor: "#3f3f3f",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
