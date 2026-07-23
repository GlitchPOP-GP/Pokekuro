import React from "react";
import { View, ImageBackground, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import CameraCaptureCard from "../components/CameraCaptureCard";
import CameraRecentItems from "../components/CameraRecentItems";
import { cameraStyles } from "../styles/screens/camera";
import GlobalStyles from "../components/Background";
export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const handleCapture = async () => {
    // カメラアクセス権限の要求
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "カメラ権限が必要です",
        "撮影を行うにはカメラへのアクセス許可が必要です。シミュレータ環境等の場合は直接追加画面へ遷移します。",
        [
          {
            text: "直接遷移する",
            onPress: () => navigation.navigate("ItemAdd", { imageIndex: 0 }),
          },
          { text: "キャンセル", style: "cancel" },
        ]
      );
      return;
    }

    try {
      // カメラを起動して撮影
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // 撮影に成功したらURIを渡してItemAdd画面へ遷移
        navigation.navigate("ItemAdd", { imageUri: result.assets[0].uri });
      }
    } catch (error) {
      console.warn("Camera launch error:", error);
      // カメラ非対応環境などのフォールバック遷移
      navigation.navigate("ItemAdd", { imageIndex: 0 });
    }
  };

  return (
    <GlobalStyles>
      <View style={[cameraStyles.overlay, { paddingTop: insets.top }]}>
        <View style={cameraStyles.content}>
          {/* Capture Guide Card (Upper part) */}
          <TouchableOpacity
            style={cameraStyles.captureCardWrapper}
            activeOpacity={0.9}
            onPress={handleCapture}
          >
            <CameraCaptureCard />
          </TouchableOpacity>

          {/* Recently Added Items List (Lower part) */}
          <CameraRecentItems />
        </View>
      </View>
    </GlobalStyles>
  );
}
