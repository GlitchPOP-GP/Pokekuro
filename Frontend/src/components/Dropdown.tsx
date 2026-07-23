import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { dropdownStyles } from "../styles/components/dropdown";

interface DropdownProps {
  placeholder: string;
  selectedValue: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  options: string[];
  onSelect: (value: string) => void;
}

// 季節・カテゴリなど、短い選択肢用の汎用ドロップダウン。
// トリガーボタンの直下に開く（下から出るボトムシートではない）。
export default function Dropdown({
  placeholder,
  selectedValue,
  isOpen,
  setIsOpen,
  options,
  onSelect,
}: DropdownProps) {
  const triggerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const openDropdown = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setIsOpen(true);
    });
  };

  return (
    <View style={dropdownStyles.container}>
      <TouchableOpacity
        ref={triggerRef as any}
        style={dropdownStyles.triggerButton}
        activeOpacity={0.8}
        onPress={openDropdown}
      >
        <Feather
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={24}
          color="#111"
          style={dropdownStyles.icon}
        />
        <Text style={[dropdownStyles.text, !selectedValue && dropdownStyles.placeholder]}>
          {selectedValue ? selectedValue : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={dropdownStyles.backdrop} onPress={() => setIsOpen(false)}>
          {anchor && (
            <View
              style={[
                dropdownStyles.menu,
                {
                  position: "absolute",
                  top: anchor.y + anchor.height + 4,
                  left: anchor.x,
                  width: anchor.width,
                },
              ]}
            >
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={dropdownStyles.optionButton}
                  onPress={() => onSelect(option)}
                >
                  <Text
                    style={[
                      dropdownStyles.optionText,
                      selectedValue === option && dropdownStyles.selectedOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}
