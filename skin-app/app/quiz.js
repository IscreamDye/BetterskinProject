import { useState, useEffect } from "react";
import { router } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import loginbg from "../assets/bg/betterskin_bg2.jpg";
import { supabase } from "../lib/supabase";

/* ---------------- QUESTIONS ---------------- */
const questions = [
  {
    question: "What is your skin type?",
    options: ["Oily", "Dry", "Combination", "Normal", "Sensitive", "I don't know"],
    multi: false,
  },
  {
    question:
      "What skin concerns are you currently experiencing? (Select all that apply)",
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
    question: "Have you ever been diagnosed with any of the following skin conditions?",
    options: ["Rosacea", "Eczema", "Cystic acne", "Melasma", "None", "Not sure", "Other (please specify)"],
    multi: true,
    allowOther: true,
  },
  {
    question: "Do you have any known skincare ingredients that irritate your skin?",
    options: ["Fragrance", "Essential oils", "Alcohol", "None", "Other (please specify)"],
    multi: true,
    allowOther: true,
  },
  {
    question: "Do any health factors currently affect your skin?",
    options: ["Hormonal changes", "Allergies", "Stress-related", "None", "Unsure", "Prefer not to say"],
    multi: true,
  },
  {
    question: "What's your main skincare goal right now?",
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
    multi: true,
  },
  {
    question: "What kind of skincare products do you prefer?",
    options: ["Natural", "Dermatologist-driven & clinical", "Doesn't matter"],
    multi: false,
  },
  {
    question: "What price range are you most comfortable to spend for a single product?",
    options: ["Budget friendly ($0-50)", "Medium range ($50-100)", "Premium ($100+)"],
    multi: false,
  },
];

/* ---------------- SCREEN ---------------- */
export default function QuizScreen() {
  const [userId, setUserId] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [otherAnswers, setOtherAnswers] = useState(Array(questions.length).fill(""));

  const question = questions[current];

  // load current user + auth guard
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.replace("/");
        return;
      }
      setUserId(data.user.id);
    };
    loadUser();
  }, []);

  const toggleOption = (option) => {
    if (question.multi) {
      setSelected((prev) =>
        prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
      );
    } else {
      setSelected([option]);
    }
  };

  const handleNext = async () => {
    const updatedAnswers = [...answers, selected];
    const updatedOtherAnswers = [...otherAnswers];
    setAnswers(updatedAnswers);
    setSelected([]);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      if (!userId) return; // safety check

      // Save quiz answers to Supabase (syncs across devices)
      // Use upsert to create profile if it doesn't exist
      const { error } = await supabase
        .from('profiles')
        .upsert(
          { 
            id: userId,
            quiz_completed: true,
            quiz_answers: updatedAnswers,
            quiz_other_answers: updatedOtherAnswers
          },
          { onConflict: 'id' }
        );

      if (error) {
        console.error("Error saving quiz data:", error);
        Alert.alert("Save Failed", "Could not save your answers. Please try again.");
        return;
      }
      
      console.log("✅ Quiz completed and saved to database");
      router.replace("/profile");
    }
  };

  const isOtherSelected = selected.includes("Other (please specify)");
  const isNextDisabled = selected.length === 0 || (isOtherSelected && otherAnswers[current].trim() === "");

  return (
    <ImageBackground source={loginbg} style={styles.background}>
      <ScrollView contentContainerStyle={styles.wrapper}>
        <BlurView intensity={100} style={styles.container}>
          <Text style={styles.question}>{question.question}</Text>

          {question.options.map((opt, idx) => {
            const isSelected = selected.includes(opt);
            const isOther = opt === "Other (please specify)";

            return (
              <View key={idx} style={{ width: "100%" }}>
                <TouchableOpacity
                  style={[styles.optionButton, isSelected && styles.optionSelected]}
                  onPress={() => toggleOption(opt)}
                >
                  <View style={styles.checkbox}>{isSelected && <View style={styles.checkboxInner} />}</View>
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>

                {isOther && isSelected && (
                  <TextInput
                    style={styles.otherInput}
                    placeholder="Please specify (max 30 chars)"
                    maxLength={30}
                    value={otherAnswers[current]}
                    onChangeText={(text) => {
                      const copy = [...otherAnswers];
                      copy[current] = text;
                      setOtherAnswers(copy);
                    }}
                  />
                )}
              </View>
            );
          })}

          <TouchableOpacity
            style={[styles.nextButton, isNextDisabled && { opacity: 0.5 }]}
            disabled={isNextDisabled}
            onPress={handleNext}
          >
            <Text style={styles.nextText}>
              {current + 1 === questions.length ? "Finish" : "Next"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.progress}>
            Question {current + 1} of {questions.length}
          </Text>
        </BlurView>
      </ScrollView>
    </ImageBackground>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  background: { flex: 1 },
  wrapper: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  container: { width: "90%", padding: 25, borderRadius: 20, backgroundColor: "#f5efe6ff", backgroundOpacity: 0.9, alignItems: "center" },
  question: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#3f3f3f" },
  optionButton: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 20, marginBottom: 15, width: "100%", borderWidth: 1, borderColor: "#838383", backgroundColor: "#d7cab8" },
  optionSelected: { backgroundColor: "#d0d0d0", borderColor: "#3f3f3f" },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#666", marginRight: 12, justifyContent: "center", alignItems: "center" },
  checkboxInner: { width: 12, height: 12, borderRadius: 3, backgroundColor: "#3f3f3f" },
  optionText: { fontSize: 16, color: "#3f3f3f" },
  otherInput: { width: "100%", padding: 10, borderRadius: 12, borderWidth: 1, borderColor: "#999", backgroundColor: "#fff", marginBottom: 15, marginTop: -5 },
  nextButton: { marginTop: 10, backgroundColor: "#a98f7e", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25 },
  nextText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  progress: { marginTop: 10, fontSize: 14, color: "#3f3f3f" },
});
