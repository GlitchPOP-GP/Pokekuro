import React, { useCallback, useRef, useState } from "react";

// React Native コンポーネント
import { View, Text, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

// 自作コンポーネント
import TextBox from "../../components/TextBox";
import Button from "../../components/Button";

// 共通スタイル
import { textStyles } from "../../styles/text";
import GlobalStyles from "../../components/Background";

// navigation型
import type { RootStackParamList } from "../../navigation/RootNavigator";
import { useAuth } from "../../store/AuthContext";

// Googleアイコン画像
import googleIcon from "../../../assets/pngwing.com.png";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Register"
>;

export default function Register({ navigation }: Props) {
  const { register } = useAuth();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [check_password, setCheck_Password] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
        if (Platform.OS === "web") window.scrollTo(0, 0);
      }, 150);
      return () => clearTimeout(timer);
    }, [])
  );

  // ログインへ戻る
  const handleRegister = () => {
    if (Platform.OS === "web") {
      (document.activeElement as HTMLElement | null)?.blur();
    }
    navigation.navigate("Login");
  };

  // 新規作成: API を叩き、成功すると認証状態が変わって
  // RootNavigator が自動的に MainTabs へ切り替わる。
  const handleLogin = async () => {
    if (submitting) return;
    const normalizedName = userName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedName || !normalizedEmail || !password) {
      Alert.alert("入力エラー", "ユーザー名・メールアドレス・パスワードを入力してください");
      return;
    }
    if (password !== check_password) {
      Alert.alert("入力エラー", "パスワードが一致しません");
      return;
    }
    if (password.length < 8) {
      Alert.alert("入力エラー", "パスワードは8文字以上にしてください");
      return;
    }
    setSubmitting(true);
    try {
      await register(normalizedEmail, password, normalizedName);
    } catch (err: any) {
      Alert.alert("登録失敗", err?.message ?? "登録できませんでした");
    } finally {
      setSubmitting(false);
    }
  };

  // Google 新規登録は未実装
  const handleGoogle = () => {
    Alert.alert("未対応", "Googleでの新規登録は現在準備中です");
  };

  return (
    <GlobalStyles>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingHorizontal: 20, paddingVertical: 48 }}
        >
        <View style={{ width: "100%", maxWidth: 420, alignItems: "center" }}>
          <Text
            accessibilityRole="header"
            style={textStyles.h1Text({
              marginBottom: 24,
            })}
          >
            新規登録
          </Text>

          <TextBox
            placeholder="ユーザー名"
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="words"
            autoComplete="name"
            style={{
              marginBottom: 16,
            }}
          />

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

          <TextBox
            placeholder="パスワード"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            style={{
              marginBottom: 16,
            }}
          />

          <TextBox
            placeholder="パスワード（確認）"
            value={check_password}
            onChangeText={setCheck_Password}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            style={{
              marginBottom: 16,
            }}
          />

          <Button
            style={{
              marginBottom: 8,
            }}
            title={submitting ? "作成中..." : "新規作成"}
            onPress={handleLogin}
            disabled={submitting}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 18,
              marginTop: 8,
            }}
          >
            <Text style={textStyles.h4Text({})}>すでにアカウントをお持ちの方は</Text>

            <TouchableOpacity
              onPress={handleRegister}
              accessibilityRole="link"
              accessibilityLabel="ログイン画面へ戻る"
            >
              <Text
                style={[textStyles.h4Text({ color: "#8a4f32" }), { marginLeft: 6, fontWeight: "700" }]}
              >
                ログイン
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              width: "100%",
              height: 1,
              backgroundColor: "#6e6e6e",
            }}
          />

          <Button
            title="Google新規登録（準備中）"
            onPress={handleGoogle}
            disabled
            style={{
              marginTop: 24,
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#ddd",
            }}
            textStyle={{
              color: "black",
              marginLeft: 10,
            }}
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
