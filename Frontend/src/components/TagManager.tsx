import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { tagManagerStyles } from "../styles/components/tagManager";

interface TagManagerProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export default function TagManager({ tags, onAddTag, onRemoveTag }: TagManagerProps) {
  const [inputVal, setInputVal] = useState("");

  const handleAdd = () => {
    if (inputVal.trim()) {
      onAddTag(inputVal.trim());
      setInputVal("");
    }
  };

  return (
    <View style={tagManagerStyles.container}>
      <View style={tagManagerStyles.tagsContainer}>
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={tagManagerStyles.tagPill}
            onPress={() => onRemoveTag(tag)}
            activeOpacity={0.7}
          >
            <Text style={tagManagerStyles.tagText}>{tag}</Text>
            <Feather name="x" size={12} color="#888" style={tagManagerStyles.xIcon} />
          </TouchableOpacity>
        ))}
        
        {/* 新規タグ入力 */}
        <View style={tagManagerStyles.inputContainer}>
          <TextInput
            placeholder="タグを追加..."
            placeholderTextColor="#b5a18c"
            value={inputVal}
            onChangeText={setInputVal}
            onSubmitEditing={handleAdd}
            style={tagManagerStyles.input}
          />
          <TouchableOpacity onPress={handleAdd} style={tagManagerStyles.addButton}>
            <Feather name="plus" size={16} color="#555" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
