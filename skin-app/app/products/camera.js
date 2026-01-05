import { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [taking, setTaking] = useState(false);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access needed</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={styles.permissionButton}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current || taking) return;
    setTaking(true);

    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.7,
      skipProcessing: true,
    });

    setTaking(false);

    router.push({
      pathname: "/products/new",
      params: { uri: photo.uri },
    });
  };

  const addWithoutPhoto = () => {
    router.push({
      pathname: "/products/new",
      params: { uri: null },
    });
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      {/* Controls stacked vertically */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.captureButton} onPress={takePhoto} />
        <TouchableOpacity style={styles.noPhotoButton} onPress={addWithoutPhoto}>
          <Text style={styles.noPhotoText}>No Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },

  controls: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
  },

  captureButton: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: "white",
    borderWidth: 6,
    borderColor: "rgba(0,0,0,0.2)",
    marginBottom: 15, // space between buttons
  },

  noPhotoButton: {
    backgroundColor: "#3f3f3f",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  noPhotoText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  permissionText: {
    fontSize: 18,
    marginBottom: 20,
    color: "#fff",
  },

  permissionButton: {
    fontSize: 18,
    color: "blue",
  },
});
