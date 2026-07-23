import { StyleSheet } from "react-native";

export const dropdownStyles = StyleSheet.create({
  container: {
    width: "100%",
  },
  triggerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5d5c5",
  },
  icon: {
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    color: "#111",
    fontWeight: "500",
  },
  placeholder: {
    color: "#b5a18c",
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    backgroundColor: "#f7f0e8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5d5c5",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  optionText: {
    fontSize: 15,
    color: "#555",
  },
  selectedOptionText: {
    color: "#000",
    fontWeight: "700",
  },
});
