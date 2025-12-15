import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function MyProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const stored = await AsyncStorage.getItem("products");
    if (stored) {
      setProducts(JSON.parse(stored));
    }
  };

  const deleteProduct = async (id) => {
    Alert.alert(
      "Delete product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated = products.filter((p) => p.id !== id);
            setProducts(updated);
            await AsyncStorage.setItem("products", JSON.stringify(updated));
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onLongPress={() => deleteProduct(item.id)}
          >
            <Image source={{ uri: item.imageUri }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No products yet</Text>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/products/camera")}
      >
        <Text style={styles.addText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },

  grid: {
    padding: 15,
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 10,
    marginBottom: 15,
    marginRight: "4%",
  },

  image: {
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#ddd",
  },

  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  category: {
    fontSize: 12,
    color: "#777",
  },

  empty: {
    textAlign: "center",
    marginTop: 80,
    fontSize: 16,
    color: "#777",
  },

  addButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  addText: {
    color: "white",
    fontSize: 32,
    lineHeight: 36,
  },
});
