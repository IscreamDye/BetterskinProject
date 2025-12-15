import { router } from "expo-router";
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { BlurView } from "expo-blur";
import { useState } from "react";
import loginbg from "../assets/images/bg/img3.jpg";

const questions = [
  {
    question: "What's your favorite color?",
    options: ["Red", "Blue", "Green", "Yellow"],
  },
  {
    question: "Pick a pet:",
    options: ["Dog", "Cat", "Bird", "Fish"],
  },
  {
    question: "Choose a hobby:",
    options: ["Reading", "Sports", "Gaming", "Traveling"],
  },
];

export default function QuizScreen() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState([]);

  const toggleOption = (option) => {
    setSelected(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected([]);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      router.push("/profile");
    }
  };

  const question = questions[current];

  return (
    <ImageBackground source={loginbg} style={styles.background}>
      <View style={styles.wrapper}>
        <BlurView intensity={100} style={styles.container}>
          <Text style={styles.question}>{question.question}</Text>

          {question.options.map((opt, idx) => {
            const isSelected = selected.includes(opt);

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionSelected
                ]}
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
            style={[
              styles.nextButton,
              selected.length === 0 && { opacity: 0.5 }
            ]}
            disabled={selected.length === 0}
            onPress={handleNext}
          >
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>

          <Text style={styles.progress}>
            Question {current + 1} of {questions.length}
          </Text>
        </BlurView>
      </View>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#3f3f3fff",
  },
  optionButton: {
    backgroundColor: "#a7a7a7a9",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 15,
    width: "100%",
    alignItems: "center",
    borderColor: "#838383ff",
    borderWidth: 1,
 
  },
  optionText: {
    fontSize: 18,
    color: "#3f3f3fff",
  },
  progress: {
    marginTop: 10,
    fontSize: 14,
    color: "#3f3f3fff",
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

});
