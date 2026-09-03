import React, { useState } from "react";

// React Native コンポーネント
import { View, Text, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// 自作コンポーネント
import TextBox from "../../components/TextBox";
import Button from "../../components/Button";

// 共通スタイル
import { textStyles } from "../../styles/text";
import  GlobalStyles  from "../../components/Background";

import type { RootStackParamList } from "../../navigation/RootNavigator";
import { useAuth } from "../../store/AuthContext";
// Googleアイコン画像
import googleIcon from "../../../assets/pngwing.com.png";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const DEMO_EMAIL = "demo@pokekuro.app";
const DEMO_PASSWORD = "demo1234";

export default function Login({ navigation }: Props) {
  const { login } = useAuth();

  // メールアドレス入力状態
  const [email, setEmail] = useState("");

  // パスワード入力状態
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 新規登録押下時
  const handleRegister = () => {
    if (Platform.OS === "web") {
      (document.activeElement as HTMLElement | null)?.blur();
    }
    navigation.navigate("Register");
  };

  const handleLogin = async () => {
    const isEmptyLogin = !email.trim() && !password;
    const normalizedEmail = isEmptyLogin
      ? DEMO_EMAIL
      : email.trim().toLowerCase();
    const loginPassword = isEmptyLogin ? DEMO_PASSWORD : password;

    if (!normalizedEmail || !loginPassword) {
      Alert.alert("入力エラー", "メールアドレスとパスワードを入力してください");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      await login(normalizedEmail, loginPassword);
    } catch (err: any) {
      Alert.alert("ログインできませんでした", err?.message ?? "通信状態を確認して、もう一度お試しください");
    } finally {
      setSubmitting(false);
    }
  };

  // Google ログインは未実装（OAuth 基盤が必要）
  const handleGoogle = () => {
    Alert.alert("未対応", "Googleログインは現在準備中です");
  };

  return (
    <GlobalStyles>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <View style={{ width: "100%", maxWidth: 420, alignItems: "center" }}>
          <Text
            accessibilityRole="header"
            style={textStyles.h1Text({
              marginBottom: 24,
            })}
          >
            ログイン
          </Text>

          {/* メールアドレス入力欄 */}
          <TextBox
            placeholder="メールアドレス"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            style={{
              marginBottom: 16,
            }}
          />

          {/* パスワード入力欄 */}
          <TextBox
            placeholder="パスワード"
            value={password}
            onChangeText={setPassword}
            // パスワード非表示
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={handleLogin}
            style={{
              marginBottom: 16,
            }}
          />

          {/* ログインボタン */}
          <Button
            style={{
              marginBottom: 8,
            }}
            title={submitting ? "ログイン中..." : "ログイン"}
            onPress={handleLogin}
            disabled={submitting}
          />

          <Text style={[textStyles.h4Text({ color: "#5f554f" }), { marginBottom: 8, textAlign: "center" }]}> 
            未入力のまま押すとデモアカウントでログインします
          </Text>

          {/* 新規登録誘導エリア */}
          <View
            style={{
              // 横並び
              flexDirection: "row",
              // 横中央
              justifyContent: "center",
              // 縦中央
              alignItems: "center",
              marginBottom: 18,
              marginTop: 8,
            }}
          >
            {/* 通常テキスト */}
            <Text style={textStyles.h4Text({})}>アカウントをお持ちでない方は</Text>

            {/* 新規登録ボタン */}
            <TouchableOpacity
              onPress={handleRegister}
              accessibilityRole="link"
              accessibilityLabel="新規登録画面へ移動"
            >
              {/* 赤文字 */}
              <Text
                style={[textStyles.h4Text({ color: "#8a4f32" }), { marginLeft: 6, fontWeight: "700" }]}
              >
                新規登録
              </Text>
            </TouchableOpacity>
          </View>

          {/* 横線 */}
          <View
            style={{
              width: "100%",
              height: 1,
              backgroundColor: "#6e6e6e",
            }}
          />

          {/* Googleログインボタン */}
          <Button
            title="Googleログイン（準備中）"
            onPress={handleGoogle}
            disabled
            // ボタン本体スタイル
            style={{
              marginTop: 24,
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#ddd",
            }}
            // テキストスタイル
            textStyle={{
              color: "black",
              marginLeft: 10,
            }}
            // Googleアイコン
            icon={
              <Image
                source={googleIcon}
                style={{
                  width: 20,
                  height: 20,
                }}
              />
            }
          />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GlobalStyles>
  );
}
