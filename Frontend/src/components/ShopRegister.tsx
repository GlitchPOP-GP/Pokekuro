import React from "react";
import { View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { shopRegisterStyles } from "../styles/components/shopRegister";

interface ShopRegisterProps {
  value: string;
  onChangeText: (text: string) => void;
  onRegisterShop: () => void;
  registering?: boolean;
}

export default function ShopRegister({
  value,
  onChangeText,
  onRegisterShop,
  registering,
}: ShopRegisterProps) {
  return (
    <View style={shopRegisterStyles.container}>
      <TextInput
        placeholder="写真を撮影した店舗を登録"
        placeholderTextColor="#b5a18c"
        value={value}
        onChangeText={onChangeText}
        style={shopRegisterStyles.input}
      />
      <TouchableOpacity
        style={shopRegisterStyles.mockButton}
        onPress={onRegisterShop}
        activeOpacity={0.7}
        disabled={registering}
      >
        {registering ? (
          <ActivityIndicator size="small" color="#555" />
        ) : (
          <Feather name="check" size={18} color="#555" />
        )}
      </TouchableOpacity>
    </View>
  );
}
