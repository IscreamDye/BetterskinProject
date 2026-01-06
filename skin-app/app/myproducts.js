import { useState, useCallback } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import BottomNav from "./BottomNav";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const insets = useSafeAreaInsets();

  const loadProducts = useCallback(async () => {
    const stored = await AsyncStorage.getItem("products");
    if (stored) setProducts(JSON.parse(stored));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

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
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products.sort((a, b) => b.id - a.id)}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          paddingTop: insets.top + 10,
          paddingHorizontal: 15,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push(`/products/${item.id}`)} // open [id].js for editing

            onLongPress={() => deleteProduct(item.id)}
          >
            <Image
              source={item.imageUri ? { uri: item.imageUri } : null}
              style={styles.image}
            />
            <Text style={styles.name}>{item.name || "Unnamed Product"}</Text>
            <Text style={styles.category}>{item.category}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No products yet</Text>}
      />

      <TouchableOpacity
        style={[styles.addButton, { bottom: insets.bottom + 100 }]}
        onPress={() => router.push("/products/new")}
      >
        <Text style={styles.addText}>＋</Text>
      </TouchableOpacity>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
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
  name: { fontSize: 14, fontWeight: "600", color: "#333" },
  category: { fontSize: 12, color: "#777" },
  empty: { textAlign: "center", marginTop: 80, fontSize: 16, color: "#777" },
  addButton: {
    position: "absolute",
    right: 50,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addText: { color: "white", fontSize: 32, lineHeight: 36 },
});
