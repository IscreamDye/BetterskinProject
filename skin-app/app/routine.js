import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomNav from "./BottomNav";
import { buildRoutine } from "./lib/routineEngine"; // 👈 engine
import { supabase } from "../lib/supabase";
import { router } from "expo-router";

export default function RoutineScreen() {
  const insets = useSafeAreaInsets();

  const [routineType, setRoutineType] = useState("morning");
  const [products, setProducts] = useState([]);
  const [routine, setRoutine] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedDays, setCompletedDays] = useState({ morning: [], evening: [] });

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.replace("/");
    };
    checkAuth();
  }, []);

  // Track removed products per routine type
  const [removedProducts, setRemovedProducts] = useState({
    morning: [],
    evening: [],
  });

  // Track checked products per day and routine type
  const [checkedProducts, setCheckedProducts] = useState({
    morning: {},
    evening: {},
  });

  // Map UI categories → engine-friendly keys
  const CATEGORY_MAP = {
    Cleanser: "cleanser",
    Toner: "toner",
    "Serum / Active Ingredients": "serums",
    Moisturizer: "moisturizer",
    "Eye cream": "eye_cream",
    Exfoliant: "exfoliant",
    Sunscreen: "spf",
  };

  /* ---------------- LOAD FROM STORAGE ---------------- */
  useEffect(() => {
    const loadAll = async () => {
      const storedProducts = await AsyncStorage.getItem("products");
      if (storedProducts) setProducts(JSON.parse(storedProducts));

      const removed = await AsyncStorage.getItem("removedProducts");
      if (removed) setRemovedProducts(JSON.parse(removed));

      const checked = await AsyncStorage.getItem("checkedProducts");
      if (checked) setCheckedProducts(JSON.parse(checked));

      const completed = await AsyncStorage.getItem("completedDays");
      if (completed) setCompletedDays(JSON.parse(completed));
    };
    loadAll();
  }, []);

  /* ---------------- BUILD ROUTINE ---------------- */
  useEffect(() => {
    generateRoutine();
  }, [products, routineType, selectedDate, removedProducts, checkedProducts]);

  const generateRoutine = () => {
    const normalizedProducts = products.map((p) => ({
      ...p,
      engineCategory: CATEGORY_MAP[p.category] || null,
    }));

    const { routine } = buildRoutine({
      products: normalizedProducts,
      routineType,
      date: selectedDate,
    });

    // Apply removedProducts filtering
    const filtered = routine.filter((p) => {
      const todayKey = p.id + "_" + selectedDate.toDateString();
      return (
        !removedProducts[routineType].includes(p.id) &&
        !removedProducts[routineType].includes(todayKey)
      );
    });

    // Apply checked state
    const todayKey = selectedDate.toDateString();
    const routineWithChecked = filtered.map((p) => ({
      ...p,
      checked:
        checkedProducts[routineType]?.[todayKey]?.includes(p.id) ?? false,
    }));

    setRoutine(routineWithChecked);
  };

  /* ---------------- CALENDAR (7 DAYS) ---------------- */
  const weekDays = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, []);

  const isSameDay = (a, b) => a.toDateString() === b.toDateString();

  /* ---------------- INTERACTIONS ---------------- */
  const toggleCheck = async (id) => {
    const todayKey = selectedDate.toDateString();
    const dayChecked = checkedProducts[routineType]?.[todayKey] || [];
    let newChecked;

    if (dayChecked.includes(id)) {
      newChecked = dayChecked.filter((i) => i !== id);
    } else {
      newChecked = [...dayChecked, id];
    }

    const updated = {
      ...checkedProducts,
      [routineType]: {
        ...checkedProducts[routineType],
        [todayKey]: newChecked,
      },
    };

    setCheckedProducts(updated);
    await AsyncStorage.setItem("checkedProducts", JSON.stringify(updated));

    // Check if all products in routine are now checked
    const routineIds = routine.map(p => p.id);
    const allChecked = routineIds.length > 0 && routineIds.every(id => newChecked.includes(id));
    const dayCompletedKey = `${todayKey}_${routineType}`;
    
    if (allChecked && !completedDays[routineType]?.includes(dayCompletedKey)) {
      // Show completion modal
      setShowCompletionModal(true);
      
      // Mark this day/routine as completed (so popup doesn't show again)
      const updatedCompleted = {
        ...completedDays,
        [routineType]: [...(completedDays[routineType] || []), dayCompletedKey],
      };
      setCompletedDays(updatedCompleted);
      await AsyncStorage.setItem("completedDays", JSON.stringify(updatedCompleted));
    }
  };

  const removeProduct = async (product) => {
    Alert.alert(
      `Remove ${product.name}?`,
      "Do you want to remove this product from just today or the whole week?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Today",
          onPress: async () => {
            const todayKey = product.id + "_" + selectedDate.toDateString();
            const updated = {
              ...removedProducts,
              [routineType]: [...removedProducts[routineType], todayKey],
            };
            setRemovedProducts(updated);
            await AsyncStorage.setItem(
              "removedProducts",
              JSON.stringify(updated)
            );
          },
        },
        {
          text: "Whole Week",
          onPress: async () => {
            const updated = {
              ...removedProducts,
              [routineType]: [...removedProducts[routineType], product.id],
            };
            setRemovedProducts(updated);
            await AsyncStorage.setItem(
              "removedProducts",
              JSON.stringify(updated)
            );
          },
        },
      ]
    );
  };

  const resetRoutine = async () => {
    Alert.alert(
      "Reset Routine",
      "Do you want to reset all removed and checked products for both morning and evening routines?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            setRemovedProducts({ morning: [], evening: [] });
            setCheckedProducts({ morning: {}, evening: {} });
            setCompletedDays({ morning: [], evening: [] });

            await AsyncStorage.setItem(
              "removedProducts",
              JSON.stringify({ morning: [], evening: [] })
            );
            await AsyncStorage.setItem(
              "checkedProducts",
              JSON.stringify({ morning: {}, evening: {} })
            );
            await AsyncStorage.setItem(
              "completedDays",
              JSON.stringify({ morning: [], evening: [] })
            );
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={[styles.productCard, item.checked && styles.checkedCard]}
      onPress={() => toggleCheck(item.id)}
      onLongPress={() => removeProduct(item)} // long press triggers removal
    >
      <View style={styles.productInfo}>
        <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
          {item.checked && <Text style={styles.checkboxTick}>✓</Text>}
        </View>

        <View style={{ flex: 1, opacity: item.checked ? 0.5 : 1 }}>
          <Text style={[styles.productName, item.checked && styles.checkedText]}>{item.name}</Text>
          <Text style={[styles.productCategory, item.checked && styles.checkedText]}>
            {item.serumType || item.category}
          </Text>
          {item.reason && <Text style={[styles.reasonText, item.checked && styles.checkedText]}>{item.reason}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  /* ---------------- UI ---------------- */
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* MORNING / EVENING */}
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

      {/* 7-DAY CALENDAR */}
      <View style={styles.calendarRow}>
        {weekDays.map((day) => {
          const active = isSameDay(day, selectedDate);

          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={[styles.dayBox, active && styles.activeDayBox]}
              onPress={() => setSelectedDate(day)}
            >
              <Text
                style={[styles.dayName, active && styles.activeDayText]}
              >
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </Text>
              <Text
                style={[styles.dayNumber, active && styles.activeDayText]}
              >
                {day.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={routine}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 15,
          paddingBottom: insets.bottom + 90,
        }}
        renderItem={renderProduct}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 50 }}>
            No routine for this day
          </Text>
        }
        ListFooterComponent={
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetRoutine}
            >
              <Text style={styles.resetButtonText}>Reset Routine</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* COMPLETION MODAL */}
      <Modal
        visible={showCompletionModal}
        transparent
        animationType="fade"
      >
        <View style={styles.completionModalBackdrop}>
          <View style={styles.completionModalContent}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>Routine Complete!</Text>
            <Text style={styles.completionText}>
              Amazing! You've finished your {routineType} routine for today.
            </Text>
            <TouchableOpacity
              style={styles.completionButton}
              onPress={() => setShowCompletionModal(false)}
            >
              <Text style={styles.completionButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav />
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },

  routineButton: {
    backgroundColor: "#d1d1d1",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginHorizontal: 10,
  },

  activeButton: {
    backgroundColor: "#877d73",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  /* CALENDAR */
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f2f2f2",
  },

  dayBox: {
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },

  activeDayBox: {
    backgroundColor: "#877d73",
  },

  dayName: {
    fontSize: 12,
    color: "#777",
  },

  dayNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  activeDayText: {
    color: "#fff",
  },

  /* PRODUCTS */
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
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#877d73",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  checkboxChecked: {
    backgroundColor: "#877d73",
    borderColor: "#877d73",
  },

  checkboxTick: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

  checkedText: {
    textDecorationLine: "line-through",
  },

  productName: {
    fontSize: 16,
    fontWeight: "600",
  },

  productCategory: {
    fontSize: 14,
    color: "#777",
  },

  reasonText: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },

  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    backgroundColor: "#a98f7e",
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  /* COMPLETION MODAL */
  completionModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  completionModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    marginHorizontal: 40,
    alignItems: "center",
  },

  completionEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },

  completionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },

  completionText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },

  completionButton: {
    backgroundColor: "#877d73",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },

  completionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
