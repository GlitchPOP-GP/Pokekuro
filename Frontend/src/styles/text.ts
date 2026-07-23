import { TextStyle } from "react-native";

//テキストのスタイルを定義するファイル
//引数としてデザインを受け取る関数を定義しているが、デフォルトで指定がされているため、カスタマイズ必要ない場合は予備だけ出すだけで使用可能

export const textStyles = {
  h1Text: ({
    color = "black",
    marginBottom = 0,
    fontSize = 40,
    fontWeight = "bold" as TextStyle["fontWeight"],
  } = {}): TextStyle => ({
    color,
    marginBottom,
    fontSize,
    fontWeight,
  }),
  h2Text: ({
    color = "black",
    marginBottom = 0,
    fontSize = 30,
    fontWeight = "bold" as TextStyle["fontWeight"],
  } = {}): TextStyle => ({
    color,
    marginBottom,
    fontSize,
    fontWeight,
  }),
  h3Text: ({
    color = "black",
    marginBottom = 0,
    fontSize = 20,
    fontWeight = "bold" as TextStyle["fontWeight"],
  } = {}): TextStyle => ({
    color,
    marginBottom,
    fontSize,
    fontWeight,
  }),
  h4Text: ({
    color = "black",
    marginBottom = 0,
    fontSize = 15,
  } = {}): TextStyle => ({
    color,
    marginBottom,
    fontSize,
  })
};