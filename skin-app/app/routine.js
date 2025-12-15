import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const morningOrder = ["Cleanser", "Toner", "Serum", "Moisturizer", "Sunscreen"];
const eveningOrder = ["Cleanser", "Toner", "Serum", "Moisturizer"];

export default function RoutineScreen() {
  const [routineType, setRoutineType] = useState("morning"); // default
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterRoutine();
  }, [products, routineType]);

  const loadProducts = async () => {
    const stored = await AsyncStorage.getItem("products");
    if (stored) setProducts(JSON.parse(stored));
  };

  const filterRoutine = () => {
    const order = routineType === "morning" ? morningOrder : eveningOrder;

    // Filter and sort products according to routine order
    const filtered = [];
    order.forEach((cat) => {
      products
        .filter((p) => p.category === cat)
        .forEach((p) => filtered.push(p));
    });

    setDisplayedProducts(filtered);
  };

  const markUsed = (id) => {
    // Remove product from displayed list
    setDisplayedProducts(displayedProducts.filter((p) => p.id !== id));
  };

  return (
    <View style={styles.container}>
      {/* Routine type buttons */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[
            styles.routineButton,
            routineType === "morning" && styles.activeButton,
          ]}
          onPress={() => setRoutineType("morning")}
        >
          <Text style={styles.buttonText}>Morning</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.routineButton,
            routineType === "evening" && styles.activeButton,
          ]}
          onPress={() => setRoutineType("evening")}
        >
          <Text style={styles.buttonText}>Evening</Text>
        </TouchableOpacity>
      </View>

      {/* Routine products */}
      <FlatList
        data={displayedProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productCategory}>{item.category}</Text>
            <TouchableOpacity
              style={styles.usedButton}
              onPress={() => markUsed(item.id)}
            >
              <Text style={styles.usedText}>Used</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 50 }}>
            No products in this routine
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
  },

  routineButton: {
    backgroundColor: "#d1d1d1",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginHorizontal: 10,
  },

  activeButton: {
    backgroundColor: "#333",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  productName: { fontSize: 16, fontWeight: "600" },

  productCategory: { fontSize: 14, color: "#777" },

  usedButton: {
    backgroundColor: "#3f3f3f",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  usedText: { color: "#fff", fontWeight: "600" },
});
