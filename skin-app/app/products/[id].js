import { useEffect, useState } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import CameraScreen from "./camera";

const categories = [
  "Cleanser",
  "Toner",
  "Serum / Active Ingredients",
  "Moisturizer",
  "Sunscreen",
  "Eye cream",
  "Exfoliant",
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

export default function EditProduct() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState(null);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [category, setCategory] = useState("Cleanser");
  const [serumType, setSerumType] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showSerumModal, setShowSerumModal] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      const stored = await AsyncStorage.getItem("products");
      const products = stored ? JSON.parse(stored) : [];
      const found = products.find((p) => p.id === id);
      if (!found) return;

      setProduct(found);
      setName(found.name || "");
      setBrand(found.brand || "");
      setIngredients(found.ingredients || "");
      setCategory(found.category || "Cleanser");
      setSerumType(found.serumType || "");
      setImageUri(found.imageUri || null);
    };
    loadProduct();
  }, [id]);

  if (!product) return null;

  const saveChanges = async () => {
    const stored = await AsyncStorage.getItem("products");
    const products = stored ? JSON.parse(stored) : [];

    const updated = products.map((p) =>
      p.id === id
        ? {
            ...p,
            name,
            brand,
            ingredients,
            category,
            serumType:
              category === "Serum / Active Ingredients" ? serumType : "",
            imageUri,
          }
        : p
    );

    await AsyncStorage.setItem("products", JSON.stringify(updated));
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

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
                if (c !== "Serum / Active Ingredients") {
                  setSerumType("");
                }
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

        {/* SERUM SELECT */}
        {category === "Serum / Active Ingredients" && (
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setShowSerumModal(true)}
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
        )}

        {/* SAVE */}
        <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
          <Text style={styles.saveText}>Save changes</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* SERUM MODAL */}
      <Modal visible={showSerumModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowSerumModal(false)}
        >
          <View style={styles.modalContent}>
            {serumTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.dropdownItem}
                onPress={() => {
                  setSerumType(type);
                  setShowSerumModal(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

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
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#f2f2f2",
  },

  topBar: {
    marginBottom: 10,
  },

  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  image: {
    height: 220,
    borderRadius: 20,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  fullImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
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
    marginBottom: 15,
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

  selectBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },

  selectText: {
    fontSize: 16,
    color: "#333",
  },

  saveButton: {
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

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },

  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  dropdownItemText: {
    fontSize: 16,
  },
});
