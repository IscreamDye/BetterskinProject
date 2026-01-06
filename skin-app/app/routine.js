import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomNav from "./BottomNav"; // adjust path

const morningOrder = ["Cleanser", "Toner", "Serum", "Moisturizer", "Sunscreen"];
const eveningOrder = ["Cleanser", "Toner", "Serum", "Moisturizer"];

export default function RoutineScreen() {
  const [routineType, setRoutineType] = useState("morning");
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const insets = useSafeAreaInsets();

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

    const filtered = [];
    order.forEach((cat) => {
      products
        .filter((p) => p.category === cat)
        .forEach((p) => {
          // Add checked state for each product
          if (p.checked === undefined) p.checked = false;
          filtered.push(p);
        });
    });

    setDisplayedProducts(filtered);
  };

  const toggleCheck = (id) => {
    setDisplayedProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, checked: !p.checked } : p
      )
    );
  };

  const renderProduct = ({ item }) => {
    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          item.checked && styles.checkedCard,
        ]}
        onPress={() => toggleCheck(item.id)}
      >
        <View style={styles.productInfo}>
          <View style={styles.checkbox}>
            {item.checked && <View style={styles.checkboxTick} />}
          </View>
          <View>
            <Text
              style={[
                styles.productName,
                item.checked && styles.checkedText,
              ]}
            >
              {item.name}
            </Text>
            <Text
              style={[
                styles.productCategory,
                item.checked && styles.checkedText,
              ]}
            >
              {item.category}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Routine type buttons */}
      <View style={[styles.buttonsRow, { marginTop: insets.top + 10 }]}>
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
        contentContainerStyle={{
          padding: 15,
          paddingBottom: insets.bottom + 80,
        }}
        renderItem={renderProduct}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 50 }}>
            No products in this routine
          </Text>
        }
      />

      {/* Shared Bottom Navigation */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
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
  },

  checkedCard: {
    backgroundColor: "#e0e0e0",
  },

  productInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  checkboxTick: {
    width: 12,
    height: 12,
    backgroundColor: "#333",
  },

  productName: { fontSize: 16, fontWeight: "600" },

  productCategory: { fontSize: 14, color: "#777" },

  checkedText: {
    color: "#777",
    textDecorationLine: "line-through",
  },
});
