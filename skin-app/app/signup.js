
import { router } from "expo-router";
import { StyleSheet, View, Text, TextInput, TouchableOpacity , ImageBackground} from "react-native";
import { BlurView } from "expo-blur";
import loginbg from '../assets/images/bg/img2.jpg'


export default function LoginScreen() {
  return (
     <ImageBackground source={loginbg} style={styles.background}>
      <View style={styles.wrapper}>
        <BlurView intensity={100}  style={styles.container} >

          <View style={styles.headerRow}>
            <Text style={styles.title_s}>Back</Text>
          </View>

          <TextInput style={styles.input} placeholder="First name" />
          <TextInput style={styles.input} placeholder="Last name" />
          <TextInput style={styles.input} placeholder="Email" />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry/>
          <TextInput style={styles.input} placeholder="Reenter password" secureTextEntry/>

          <TouchableOpacity style={styles.nextButton} onPress={() => router.push("/")}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>

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
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(231, 231, 231, 0.81)", 
    overflow: "hidden", 
    
  },
  title: {
    fontSize: 32,
    color: "#3f3f3fff",
    textAlign: "center",
  },
  title_mid: {
    fontSize: 22,
    color: "#3f3f3fff",
    textAlign: "center",
  },
  title_s: {
    fontSize: 16,
    color: "#3f3f3fff",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(85, 85, 85, 0.7)",
    padding: 10,
    marginBottom: 20,
    borderRadius: 20,
    color: "#fff",
  },
  headerRow: {
  flexDirection: "row",       
  justifyContent: "space-between", 
  alignItems: "center",       
  marginBottom: 20,
},
nextButton: {
  backgroundColor: "#6d6d6dff", // semi-transparent
  paddingVertical: 12,
  paddingHorizontal: 25,
  borderRadius: 20,
  alignItems: "center",
  shadowColor: "#000",

},
nextButtonText: {
  color: "#000000ff",
  fontWeight: "bold",
  fontSize: 16,
},

});