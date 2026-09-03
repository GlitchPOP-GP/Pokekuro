import { TextInput, TextInputProps } from "react-native";
import { textboxStyles } from "../styles/textbox";

type Props = Omit<TextInputProps, "style"> & {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  style?: TextInputProps["style"];
};

export default function TextBox({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  style,
  ...inputProps
}: Props) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#888" // プレースホルダーテキストの色を指定のため、ここで定義
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      style={[textboxStyles.input, style]}
      autoCapitalize="none"
      {...inputProps}
    />
  );
}
