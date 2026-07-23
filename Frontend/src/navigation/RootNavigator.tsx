// src/navigation/RootNavigator.tsx

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "../screens/Auth/Login";
import Register from "../screens/Auth/Register";
import FooterNavigator from "./TabNavigator";
import ItemAdd from "../screens/ItemAdd";
import PostDetail from "../screens/PostDetail";
import { useAuth } from "../store/AuthContext";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  ItemAdd: { imageIndex?: number; imageUri?: string };
  PostDetail: { postIndex: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  // 認証状態でスタックを切り替える。ログイン成功で isAuthenticated が
  // true になると自動的に MainTabs ツリーへ差し替わる。
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={FooterNavigator} />
            <Stack.Screen name="ItemAdd" component={ItemAdd} />
            <Stack.Screen name="PostDetail" component={PostDetail} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
