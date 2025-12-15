
import { router } from "expo-router";
import { StyleSheet, View, Text, TextInput, Button, ImageBackground} from "react-native";
import { BlurView } from "expo-blur";
import loginbg from '../assets/images/bg/img1.jpg'


export default function LoginScreen() {
  return (
     <ImageBackground source={loginbg} style={styles.background}>
      <View style={styles.wrapper}>
        <BlurView intensity={100}  style={styles.container} >

          <View style={styles.headerRow}>
            <Text style={styles.title}>Log in</Text>
            <Text style={styles.title_mid} onPress={() => router.push("/signup")}>Sign up</Text>
          </View>

          <TextInput style={styles.input} placeholder="Username" />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry />

          <View style={styles.headerRow}>
            <Text style={styles.title_s} onPress={() => router.push("/quiz")}>Forgot password</Text>
            <Text style={styles.title_s} onPress={() => router.push("/quiz")}>Next</Text>
          </View>

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
    alignItems: "center", // centers the form horizontally
  },
  container: {
    width: "90%",
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(231, 231, 231, 0.81)", // semi-transparent for glass
    overflow: "hidden", // required for BlurView to clip
    
  },
  title: {
    fontSize: 32,
    //fontWeight: "bold",
    //marginBottom: 20,
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
}
});