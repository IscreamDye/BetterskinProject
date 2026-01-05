import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";

const categories = [
  "Cleanser",
  "Toner",
  "Serum / Active Ingredients",
  "Moisturizer",
  "Eye cream",
  "Exfoliant",
  "Sunscreen",
];

export default function NewProduct() {
  const { uri } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [category, setCategory] = useState("Cleanser");

  const saveProduct = async () => {
    const stored = await AsyncStorage.getItem("products");
    const products = stored ? JSON.parse(stored) : [];

    const newProduct = {
      id: Date.now().toString(),
      name,
      brand,
      ingredients,
      category,
      imageUri: uri,
    };

    await AsyncStorage.setItem(
      "products",
      JSON.stringify([...products, newProduct])
    );

    router.replace("/myproducts");
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} />

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
            style={[
              styles.category,
              category === c && styles.activeCategory,
            ]}
            onPress={() => setCategory(c)}
          >
            {c}
          </Text>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveProduct}>
        <Text style={styles.saveText}>Save Product</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f2f2",
  },

  image: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    marginBottom: 20,
    backgroundColor: "#ccc",
  },

  input: {
    backgroundColor: "white",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 25,
  },

  category: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    marginRight: 10,
    marginBottom: 10,
    fontSize: 14,
    color: "#333",
  },

  activeCategory: {
    backgroundColor: "#6b6b6b",
    color: "white",
  },

  saveButton: {
    backgroundColor: "#3f3f3f",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
  },

  saveText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
