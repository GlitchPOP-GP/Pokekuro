import { TextInput, StyleProp, TextStyle } from "react-native";
import { textboxStyles } from "../styles/textbox";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  style?: StyleProp<TextStyle>;
};

export default function TextBox({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  style,
}: Props) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#888" // プレースホルダーテキストの色を指定のため、ここで定義
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      style={[textboxStyles.input, style]}
    />
  );
}
