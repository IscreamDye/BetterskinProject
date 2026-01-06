import { useState } from "react";
import { router } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import loginbg from "../assets/images/bg/img3.jpg";

// Define your onboarding survey questions
const questions = [
  {
    question: "What is your skin type?",
    options: ["Oily", "Dry", "Combination", "Normal", "Sensitive", "I don’t know"],
    multi: false,
  },
  {
    question: "What skin concerns are you currently experiencing? (Select all that apply)",
    options: ["Acne", "Dryness", "Redness", "Aging (wrinkles, firmness)", "Hyperpigmentation", "Dark spots", "Dullness", "Sensitivity"],
    multi: true,
  },
  {
    question: "Have you ever been diagnosed with any of the following skin conditions?",
    options: ["Rosacea", "Eczema", "Cystic acne", "Melasma", "None", "Not sure", "Other (please specify)"],
    multi: true,
  },
  {
    question: "Do you have any known skincare ingredients that irritate your skin?",
    options: ["Fragrance", "Essential oils", "Alcohol", "Other (please specify)"],
    multi: true,
  },
  {
    question: "Do any health factors currently affect your skin?",
    options: ["Hormonal changes", "Allergies", "Stress-related", "None", "Unsure", "Prefer not to say"],
    multi: true,
  },
  {
    question: "What’s your main skincare goal right now?",
    options: ["Clear acne", "Anti-aging", "Even tone", "Hydration", "Calm sensitive skin", "Healthy glow", "Simplify routine", "Save money", "Save time"],
    multi: false,
  },
  {
    question: "What kind of skincare products do you prefer?",
    options: ["Natural", "Dermatologist-driven & clinical"], // For simplicity using single select
    multi: false,
  },
  {
    question: "What price range are you most comfortable with for a single product?",
    options: ["Budget friendly ($0-50)", "Medium range ($50-100)", "Premium ($100+)"],
    multi: false,
  },
];

export default function QuizScreen() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState([]);
  const [answers, setAnswers] = useState([]);

  const question = questions[current];

  const toggleOption = (option) => {
    if (question.multi) {
      setSelected(prev =>
        prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
      );
    } else {
      setSelected([option]);
    }
  };

  const handleNext = async () => {
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected([]);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      // Save onboarding complete
      try {
        await AsyncStorage.setItem("onboardingComplete", "true");
        await AsyncStorage.setItem("surveyAnswers", JSON.stringify(newAnswers));
      } catch (e) {
        console.error("Failed to save onboarding", e);
      }
      router.replace("/profile");
    }
  };

  return (
    <ImageBackground source={loginbg} style={styles.background}>
      <ScrollView contentContainerStyle={styles.wrapper}>
        <BlurView intensity={100} style={styles.container}>
          <Text style={styles.question}>{question.question}</Text>

          {question.options.map((opt, idx) => {
            const isSelected = selected.includes(opt);
            return (
              <TouchableOpacity
                key={idx}
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

          <TouchableOpacity
            style={[styles.nextButton, selected.length === 0 && { opacity: 0.5 }]}
            disabled={selected.length === 0}
            onPress={handleNext}
          >
            <Text style={styles.nextText}>{current + 1 === questions.length ? "Finish" : "Next"}</Text>
          </TouchableOpacity>

          <Text style={styles.progress}>
            Question {current + 1} of {questions.length}
          </Text>
        </BlurView>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
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
    backgroundColor: "rgba(231, 231, 231, 0.81)",
    overflow: "hidden",
    alignItems: "center",
  },
  question: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#3f3f3fff",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 15,
    width: "100%",
    borderWidth: 1,
    borderColor: "#838383ff",
    backgroundColor: "#a7a7a7a9",
  },
  optionSelected: {
    backgroundColor: "#d0d0d0",
    borderColor: "#3f3f3f",
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
    color: "#3f3f3fff",
  },
  nextButton: {
    marginTop: 10,
    backgroundColor: "#3f3f3f",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  nextText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  progress: {
    marginTop: 10,
    fontSize: 14,
    color: "#3f3f3fff",
  },
});
