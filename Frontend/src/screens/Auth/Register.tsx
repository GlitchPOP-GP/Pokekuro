import React, { useState } from "react";

// React Native コンポーネント
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

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

  // ログインへ戻る
  const handleRegister = () => {
    navigation.navigate("Login");
  };

  // 新規作成: API を叩き、成功すると認証状態が変わって
  // RootNavigator が自動的に MainTabs へ切り替わる。
  const handleLogin = async () => {
    if (submitting) return;
    if (!userName || !email || !password) {
      Alert.alert("入力エラー", "ユーザー名・メールアドレス・パスワードを入力してください");
      return;
    }
    if (password !== check_password) {
      Alert.alert("入力エラー", "パスワードが一致しません");
      return;
    }
    setSubmitting(true);
    try {
      await register(email, password, userName);
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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <View style={{ width: "100%", alignItems: "center" }}>
          <Text
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
            style={{
              marginBottom: 16,
            }}
          />

          <TextBox
            placeholder="メールアドレス"
            value={email}
            onChangeText={setEmail}
            style={{
              marginBottom: 16,
            }}
          />

          <TextBox
            placeholder="パスワード"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{
              marginBottom: 16,
            }}
          />

          <TextBox
            placeholder="パスワード確認用(再入力)"
            value={check_password}
            onChangeText={setCheck_Password}
            secureTextEntry
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
            <Text style={textStyles.h4Text({})}>アカウントをお持ちの方</Text>

            <TouchableOpacity onPress={handleRegister}>
              <Text
                style={textStyles.h4Text({
                  color: "#ff0000",
                  marginLeft: 6,
                })}
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
            title="Googleで新規登録"
            onPress={handleGoogle}
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
      </View>
    </GlobalStyles>
  );
}