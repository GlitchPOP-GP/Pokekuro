import React from "react";

import { ImageBackground, View } from "react-native";


type Props = {
  children: React.ReactNode;
};

export default function GlobalStyles({ children }: Props) {
  return (
    <ImageBackground
      source={require("../../assets/back.jpg")}
      resizeMode="cover"
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(255, 255, 255, 0.57)",
        }}
      >
        {children}
      </View>
    </ImageBackground>
  );
}
