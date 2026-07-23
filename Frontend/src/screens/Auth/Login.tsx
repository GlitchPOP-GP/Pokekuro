import React, { useState } from "react";

// React Native コンポーネント
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
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

export default function Login({ navigation }: Props) {
  const { bypassLogin } = useAuth();

  // メールアドレス入力状態
  const [email, setEmail] = useState("");

  // パスワード入力状態
  const [password, setPassword] = useState("");

  // 新規登録押下時
  const handleRegister = () => {
    // ここで新規登録ページへ遷移
    navigation.navigate("Register");
  };

  // ログイン押下時: 認証は未実装なので、いったんそのまま次画面へ進める。
  // bypassLogin で認証状態を立てると RootNavigator が MainTabs へ切り替わる。
  const handleLogin = () => {
    bypassLogin();
  };

  // Google ログインは未実装（OAuth 基盤が必要）
  const handleGoogle = () => {
    Alert.alert("未対応", "Googleログインは現在準備中です");
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
            ログイン
          </Text>

          {/* メールアドレス入力欄 */}
          <TextBox
            placeholder="メールアドレス"
            value={email}
            onChangeText={setEmail}
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
            style={{
              marginBottom: 16,
            }}
          />

          {/* ログインボタン */}
          <Button
            style={{
              marginBottom: 8,
            }}
            title="ログイン"
            onPress={handleLogin}
          />

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
            <TouchableOpacity onPress={handleRegister}>
              {/* 赤文字 */}
              <Text
                style={textStyles.h4Text({
                  color: "#ff0000",
                  marginLeft: 6,
                })}
              >
                こちら
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
            title="Googleでログイン"
            onPress={handleGoogle}
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
      </View>
    </GlobalStyles>
  );
}
