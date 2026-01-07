import { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { BlurView } from "expo-blur";
import { supabase } from "../lib/supabase";
import loginbg from "../assets/images/bg/img3.jpg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "./BottomNav";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock questions (should match your QuizScreen)
const questions = [
  {
    question: "My skin type",
    options: ["Oily", "Dry", "Combination", "Normal", "Sensitive", "I don’t know"],
    multi: false,
  },
  {
    question: "Skin concerns",
    options: [
      "Acne",
      "Dryness",
      "Redness",
      "Aging (wrinkles, firmness)",
      "Hyperpigmentation",
      "Dark spots",
      "Dullness",
      "Sensitivity",
    ],
    multi: true,
  },
  {
    question: "Diagnosed skin conditions",
    options: [
      "Rosacea",
      "Eczema",
      "Cystic acne",
      "Melasma",
      "None",
      "Not sure",
      "Other (please specify)",
    ],
    multi: true,
  },
  {
    question: "Ingredients that irritate my skin",
    options: ["Fragrance", "Essential oils", "Alcohol", "None", "Other (please specify)"],
    multi: true,
  },
  {
    question: "Health factors affecting my skin",
    options: [
      "Hormonal changes",
      "Allergies",
      "Stress-related",
      "None",
      "Unsure",
      "Prefer not to say",
    ],
    multi: true,
  },
  {
    question: "Main skincare goal",
    options: [
      "Clear acne",
      "Anti-aging",
      "Even tone",
      "Hydration",
      "Calm sensitive skin",
      "Healthy glow",
      "Simplify routine",
      "Save money",
      "Save time",
    ],
    multi: true, // changed to multi-select
  },
  {
    question: "Preferred product style",
    options: ["Natural", "Dermatologist-driven & clinical", "Doesn't matter"],
    multi: false,
  },
  {
    question: "Comfortable price range",
    options: ["Budget friendly ($0-50)", "Medium range ($50-100)", "Premium ($100+)"],
    multi: false,
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [otherAnswers, setOtherAnswers] = useState([]);

  const [editingIndex, setEditingIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [otherInput, setOtherInput] = useState("");

  const questionLabels = [
    "My skin type",
    "Skin concerns",
    "Diagnosed skin conditions",
    "Ingredients that irritate my skin",
    "Health factors affecting my skin",
    "Main skincare goal",
    "Preferred product style",
    "Comfortable price range",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    const fetchSurvey = async () => {
      try {
        const storedAnswers = await AsyncStorage.getItem("surveyAnswers");
        const storedOther = await AsyncStorage.getItem("surveyOtherAnswers");

        if (storedAnswers) setAnswers(JSON.parse(storedAnswers));
        if (storedOther) setOtherAnswers(JSON.parse(storedOther));
      } catch (e) {
        console.error("Failed to load survey data", e);
      }
    };

    fetchUser();
    fetchSurvey();
  }, []);

  // Render text for profile display
  const renderAnswerText = (ans, idx) => {
    let baseAnswers = Array.isArray(ans)
      ? ans.filter(a => a !== "Other (please specify)")
      : [ans];

    const other = otherAnswers[idx];
    if (other && other.trim().length > 0) baseAnswers.push(other);

    return baseAnswers.length > 0 ? baseAnswers.join(", ") : "—";
  };

  const openEditModal = (idx) => {
    setEditingIndex(idx);
    setShowModal(true);

    const currentAns = answers[idx] || [];
    setSelectedOptions(
      Array.isArray(currentAns)
        ? currentAns
        : currentAns ? [currentAns] : []
    );

    const other = otherAnswers[idx] || "";
    setOtherInput(other);
  };

  const toggleOption = (option) => {
    const question = questions[editingIndex];
    if (question.multi) {
      setSelectedOptions(prev =>
        prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
      );
    } else {
      setSelectedOptions([option]);
    }

    // Clear other input if "Other" is deselected
    if (option !== "Other (please specify)" && selectedOptions.includes("Other (please specify)")) {
      setOtherInput("");
    }
  };

  const saveEditedAnswer = async () => {
    const updatedAnswers = [...answers];
    const updatedOther = [...otherAnswers];

    // Save selected options
    updatedAnswers[editingIndex] = selectedOptions;

    // Save other input only if "Other (please specify)" is selected
    if (selectedOptions.includes("Other (please specify)")) {
      updatedOther[editingIndex] = otherInput;
    } else {
      updatedOther[editingIndex] = "";
    }

    setAnswers(updatedAnswers);
    setOtherAnswers(updatedOther);

    await AsyncStorage.setItem("surveyAnswers", JSON.stringify(updatedAnswers));
    await AsyncStorage.setItem("surveyOtherAnswers", JSON.stringify(updatedOther));

    setShowModal(false);
  };

  return (
    <ImageBackground source={loginbg} style={styles.background}>
      <ScrollView
        contentContainerStyle={[
          styles.wrapper,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        <BlurView intensity={100} style={styles.container}>
          {/* Header */}
          <Text style={styles.header}>Profile</Text>

          {/* User Info */}
          <View style={styles.userBox}>
            <Text style={styles.userText}>
              {user?.user_metadata?.first_name || ""}{" "}
              {user?.user_metadata?.last_name || ""}
            </Text>
          </View>

          {/* Survey Answers */}
          {answers.map((ans, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.answerBox}
              activeOpacity={0.7}
              onPress={() => openEditModal(idx)}
            >
              <Text style={styles.answerLabel}>{questionLabels[idx]}</Text>
              <Text style={styles.answerText}>{renderAnswerText(ans, idx)}</Text>
            </TouchableOpacity>
          ))}
        </BlurView>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalWrapper}>
          <BlurView intensity={100} style={styles.modalContent}>
            <Text style={styles.modalHeader}>
              Edit: {questionLabels[editingIndex]}
            </Text>

            {editingIndex !== null &&
              questions[editingIndex].options.map((opt, i) => {
                const isSelected = selectedOptions.includes(opt);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.optionButton, isSelected && styles.optionSelected]}
                    onPress={() => toggleOption(opt)}
                  >
                    <View style={styles.checkbox}>
                      {isSelected && <View style={styles.checkboxInner} />}
                    </View>
                    <Text style={styles.optionText}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}

            {/* Other input box */}
            {selectedOptions.includes("Other (please specify)") && (
              <TextInput
                style={styles.otherInput}
                placeholder="Specify..."
                maxLength={30}
                value={otherInput}
                onChangeText={setOtherInput}
              />
            )}

            <TouchableOpacity style={styles.saveButton} onPress={saveEditedAnswer}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>

      <BottomNav />
    </ImageBackground>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  background: { flex: 1 },
  wrapper: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  container: {
    width: "90%",
    padding: 25,
    borderRadius: 20,
    backgroundColor: "rgba(231,231,231,0.81)",
    alignItems: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#3f3f3f",
  },
  userBox: {
    width: "100%",
    padding: 20,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.85)",
    marginBottom: 20,
    alignItems: "center",
  },
  userText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3f3f3f",
  },
  answerBox: {
    width: "100%",
    padding: 15,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.85)",
    marginBottom: 15,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
    color: "#3f3f3f",
  },
  answerText: {
    fontSize: 16,
    color: "#555",
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 25,
    borderRadius: 20,
    backgroundColor: "rgba(231,231,231,0.95)",
    alignItems: "center",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: "#838383",
    backgroundColor: "#e0e0e0",
  },
  optionSelected: {
    backgroundColor: "#d0d0d0",
    borderColor: "#333",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#666",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: "#3f3f3f",
  },
  optionText: {
    fontSize: 16,
    color: "#3f3f3f",
  },
  otherInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#777",
    borderRadius: 15,
    padding: 10,
    marginVertical: 12,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: "#3f3f3f",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  saveText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 40,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
